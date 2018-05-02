const db = require("../utils/db");
const ProgressLogger = require("../utils/progressLogger");
const streaming = require("../utils/streaming");
const topology = require("../utils/topology");

const { ZONING_TABLE } = require("./model");

const ZONING_PATH = `${__dirname}/input/california.geo.json`;

async function load() {
  await db.dropTable(ZONING_TABLE);
  await db.createFeatureTable(ZONING_TABLE, "MultiPolygon");

  console.log(`Loading zoning data...`);
  const logger = new ProgressLogger().start();

  await streaming.streamFeatureCollectionFile(ZONING_PATH, async feature => {
    logger.increment();
    await db.insertFeature(ZONING_TABLE, topology.multiPolygon(feature));
  });

  logger.finish();
}

load();
