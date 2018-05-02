const fs = require("fs");
const turf = require("@turf/turf");
const ArgumentParser = require("argparse").ArgumentParser;
const db = require("../utils/db");
const ProgressLogger = require("../utils/progressLogger");
const listDirectories = require("../utils/listDirectories");
const streaming = require("../utils/streaming");
const topology = require("../utils/topology");

const { PARCELS_TABLE } = require("./model");

const PARCELS_DIR = `${__dirname}/input`;

async function load({ include, drop }) {
  if (drop) {
    await db.dropTable(PARCELS_TABLE);
    await db.createFeatureTable(PARCELS_TABLE, "MultiPolygon");
    await db.createPropertyIndex(PARCELS_TABLE, "county");
  }

  console.log(`${!drop ? "Adding" : "Loading"} parcel data...`);
  const logger = new ProgressLogger().start();

  const countiesDirs = listDirectories(PARCELS_DIR).filter(d => {
    return !include || include.has(d.name);
  });

  countiesDirs.forEach(subdir => console.log(`- ${subdir.name}`));
  logger.addGroups(countiesDirs.length);

  for (let i = 0; i < countiesDirs.length; i++) {
    const countyDir = countiesDirs[i];
    const parcelsPath = `${countyDir.path}/parcels.geo.json`;
    const infoPath = `${countyDir.path}/info.json`;
    const info = JSON.parse(fs.readFileSync(infoPath, "utf8"));
    const county = info.name;
    const key = info.id_key;

    let ids = new Set();

    const handleFeature = async feature => {
      logger.increment();

      // ignore features without geometry
      if (!feature.geometry) {
        return;
      }

      // ignore duplicate features
      const id = `${countyDir.name}/${feature.properties[key]}`;
      if (ids.has(id)) {
        return;
      } else {
        ids.add(id);
      }

      // simplify geometry
      try {
        turf.simplify(feature, {
          tolerance: 1e-5,
          highQuality: true,
          mutate: true
        });
      } catch (e) {
        console.log("Could not simplify polygon for parcel; skipping", id, JSON.stringify(feature));
      }

      // calculate area (m^2)
      const area = turf.area(feature);

      // write the new feature
      await db.insertFeature(
        PARCELS_TABLE,
        topology.multiPolygon({
          type: "Feature",
          geometry: feature.geometry,
          properties: {
            id,
            area,
            county
          }
        })
      );
    };

    await streaming.streamFeatureCollectionFile(parcelsPath, handleFeature);
    logger.finishGroup();
  }

  logger.finish();
}

const parser = new ArgumentParser();
parser.addArgument("--include", { nargs: "+" });
parser.addArgument("--drop", { action: "storeTrue" });
const args = parser.parseArgs();

load({
  include: args.include ? new Set(args.include) : null,
  drop: args.drop
});
