const pg = require("pg");
const uuid = require("node-uuid");
const through2 = require("through2");
const QueryStream = require("pg-query-stream");
const streaming = require("./streaming");

const pool = new pg.Pool({
  port: 5432,
  host: "localhost",
  database: "ca_yimby",
  max: 8
});

async function dropTable(tableName) {
  console.log(`Dropping table ${tableName}...`);
  await pool.query({
    text: `DROP TABLE IF EXISTS ${tableName}`
  });
}

async function createFeatureTable(tableName, geometryType) {
  console.log(`Creating table ${tableName} (${geometryType})...`);
  await pool.query({
    text: `CREATE TABLE ${tableName} (id TEXT PRIMARY KEY, geom geometry(${geometryType}), props jsonb)`
  });
  await pool.query({
    text: `CREATE UNIQUE INDEX ${tableName}_id_idx ON ${tableName}(id)`
  });
  await pool.query({
    text: `CREATE INDEX ${tableName}_geom_idx ON ${tableName} USING GIST (geom)`
  });
}

async function createPropertyIndex(tableName, property) {
  console.log(`Creating property index ${tableName}.${property}...`);
  await pool.query({
    text: `CREATE INDEX ${tableName}_${property}_idx ON ${tableName} ((props->>'${property}'));`
  });
}

async function insertFeature(tableName, feature) {
  if (!feature.geometry) {
    console.log("no geometry for feature");
    return new Promise((resolve, reject) => resolve());
  }
  const { id, ...properties } = feature.properties;
  return pool
    .query({
      text: `
        INSERT INTO ${tableName} as t (id, geom, props) VALUES($1, ST_GeomFromGeoJSON($2), $3)
        ON CONFLICT (id) DO UPDATE SET geom = EXCLUDED.geom, props = t.props || EXCLUDED.props
      `,
      values: [
        id || uuid.v4(),
        JSON.stringify(feature.geometry),
        JSON.stringify(properties)
      ]
    })
    .catch(error => {
      console.log(
        "Could not insert feature",
        error.message,
        JSON.stringify(feature)
      );
    });
}

async function updateFeatureProperties(tableName, id, properties) {
  return pool.query({
    text: `UPDATE ${tableName} SET props = props || $1 WHERE id = $2`,
    values: [JSON.stringify(properties), id]
  });
}

function _featureFromRow(row) {
  const { id, geom, props } = row;
  return {
    type: "Feature",
    geometry: JSON.parse(geom),
    properties: { id, ...props }
  };
}

async function _queryFeatures(query) {
  return pool.query(query).then(result => result.rows.map(_featureFromRow));
}

async function queryFeaturesAtPoint(tableName, point) {
  return _queryFeatures({
    text: `SELECT id, ST_AsGeoJSON(geom) as geom, props FROM ${tableName} WHERE ST_Contains(geom, ST_Point($1, $2))`,
    values: [...point.geometry.coordinates]
  });
}

async function queryFeaturesInBBox(tableName, bbox) {
  return _queryFeatures({
    text: `SELECT id, ST_AsGeoJSON(geom) as geom, props FROM ${tableName} WHERE geom && ST_MakeEnvelope($1, $2, $3, $4)`,
    values: [...bbox]
  });
}

const _transformRowToFeature = through2.obj((row, encoding, callback) => {
  callback(null, _featureFromRow(row));
});

async function streamFeatures(tableName, bbox, handleFeature) {
  let text = `SELECT id, ST_AsGeoJSON(geom) as geom, props FROM ${tableName}`;
  let values = [];
  if (bbox) {
    text += ` WHERE geom && ST_MakeEnvelope($1, $2, $3, $4)`;
    values = bbox;
  }

  const handleFeatures = through2.obj((features, encoding, callback) => {
    Promise.all(features.map(handleFeature)).then(() => callback());
  });

  const query = new QueryStream(text, values);
  const client = await pool.connect();
  const stream = client.query(query);
  return new Promise((resolve, reject) => {
    stream.on("close", client.release);
    stream
      .pipe(_transformRowToFeature)
      .pipe(streaming.batch(16))
      .pipe(handleFeatures)
      .on("finish", () => {
        resolve();
      });
  });
}

module.exports = {
  pool,
  dropTable,
  createFeatureTable,
  createPropertyIndex,
  insertFeature,
  updateFeatureProperties,
  streamFeatures,
  queryFeaturesAtPoint,
  queryFeaturesInBBox
};
