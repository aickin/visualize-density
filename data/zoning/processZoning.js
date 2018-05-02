/**
 * Process the zoning data into small tiles for speedy rendering on the front end
 * @author mattwigway
 */

const turf = require("@turf/turf");
const fs = require("fs");

const ProgressLogger = require("../utils/progressLogger");
const streaming = require("../utils/streaming");

const {
  FEET_TO_METERS,
  HECTARES_TO_ACRES
} = require("@aickin/visualize-density-common").convert;

const INPUT_PATH = `${__dirname}/input/california.geo.json`;
const OUTPUT_DIR = `${__dirname}/../../private-site/public/zoning`;

const TILE_SIZE_DEGREES = 0.25;
const CA_WEST = -125; // rough boundaries of California, origins for tile system
const CA_NORTH = 42;

/** Get the tile numbers for a given point */
function tileForPoint({ lat, lng }) {
  return {
    x: Math.floor((lng - CA_WEST) / TILE_SIZE_DEGREES),
    y: Math.floor(-(lat - CA_NORTH) / TILE_SIZE_DEGREES)
  };
}

/** Simplify the output of the zoning generation script */
function processFeature(feature) {
  // yick; same as in ZoningEnricher.js
  if (
    feature.properties.zone ===
    "P-Telegraph Hill-NB Residential,Waterfront 2-40-X-40.0"
  ) {
    console.log("skipping crazy zone");
    return;
  }
  try {
    turf.simplify(feature, {
      tolerance: 1e-5,
      highQuality: true,
      mutate: true
    });
  } catch (e) {
    if (e.message === "invalid polygon") {
      console.log("Invalid polygon for zone:", feature.properties.zone);
      console.log("Coordinates:", feature.geometry.coordinates);
    } else {
      throw e;
    }
  }

  const {
    zone,
    note,
    hiMaxHeightMeters,
    hiMinParkingPerUnit,
    loMaxUnitsPerHectare
  } = feature.properties;

  return {
    geometry: feature.geometry,
    properties: {
      // conversion factor is stored as feet to meters because that is exactly .3048, and 1/.3048 is an irrational number
      heightLimitFeet: hiMaxHeightMeters / FEET_TO_METERS,
      parkingPerUnit: hiMinParkingPerUnit,
      maxDensityPerAcre: loMaxUnitsPerHectare / HECTARES_TO_ACRES,
      zone: zone,
      note: note
    }
  };
}

console.log(`Loading zoning from ${INPUT_PATH}`);
const logger = new ProgressLogger().start();

const tiles = {};
let maxX = 0;
let maxY = 0;

function handleFeature(lineReader, feature) {
  logger.increment();

  const feat = processFeature(feature);
  if (!feat) {
    return;
  }
  // Just use first coord, to make things easy and fast. This will be fine since the zoning areas are small and we'll
  // oversample anyhow.
  const [lng, lat] =
    feat.geometry.type === "MultiPolygon"
      ? feat.geometry.coordinates[0][0][0]
      : feat.geometry.coordinates[0][0];
  const { x, y } = tileForPoint({ lng, lat });

  if (tiles[x] === undefined) tiles[x] = {};
  if (tiles[x][y] === undefined) tiles[x][y] = [];

  tiles[x][y].push(feat);

  if (x > maxX) maxX = x;
  if (y > maxY) maxY = y;
}

function writeTiles() {
  console.log("writing tiles");
  for (let x = 0; x <= maxX; x++) {
    if (tiles[x] == null) continue;

    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
    if (!fs.existsSync(`${OUTPUT_DIR}/tiles`))
      fs.mkdirSync(`${OUTPUT_DIR}/tiles`);
    if (!fs.existsSync(`${OUTPUT_DIR}/tiles/${x}`))
      fs.mkdirSync(`${OUTPUT_DIR}/tiles/${x}`);
    for (let y = 0; y <= maxY; y++) {
      if (tiles[x][y] == null) continue;
      console.log(`  ${x}, ${y}`);

      const data = {
        type: "FeatureCollection",
        features: tiles[x][y]
      };

      fs.writeFileSync(
        `${OUTPUT_DIR}/tiles/${x}/${y}.geo.json`,
        JSON.stringify(
          data,
          (k, v) =>
            v && v.map
              ? v.map(n => (n && n.toFixed ? Number(n.toFixed(6)) : n))
              : v
        )
      );
    }
  }

  console.log("Done!");
}

console.log("processing and simplifying zoning");
streaming.streamFeatureCollectionFile(INPUT_PATH, handleFeature).then(() => {
  logger.finish();
  writeTiles();
});
