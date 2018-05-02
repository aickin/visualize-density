const turf = require("@turf/turf");
const ArgumentParser = require("argparse").ArgumentParser;
const db = require("../utils/db");
const ProgressLogger = require("../utils/progressLogger");
const streaming = require("../utils/streaming");
const listDirectories = require("../utils/listDirectories");

const { STREETS_TABLE } = require("./model");

const STREETS_DIR = `${__dirname}/../streets/input`;

async function load({ include, drop }) {
  if (drop) {
    await db.dropTable(STREETS_TABLE);
    await db.createFeatureTable(STREETS_TABLE, "LineString");
  }

  console.log(`Loading street data...`);
  const logger = new ProgressLogger().start();

  const countiesDirs = listDirectories(STREETS_DIR).filter(d => {
    return !include || include.has(d.name);
  });

  countiesDirs.forEach(subdir => console.log(`- ${subdir.name}`));
  logger.addGroups(countiesDirs.length);

  const handleFeature = async feature => {
    logger.increment();

    let chunkFeatures = [];
    const chunks = turf.lineChunk(feature, 500, { units: "feet" });
    chunks.features.forEach(chunk => {
      chunkFeatures.push({
        ...chunk,
        properties: feature.properties
        // TODO add stable id
      });
    });

    await Promise.all(
      chunkFeatures.map(feature => {
        return db.insertFeature(STREETS_TABLE, feature);
      })
    );
  };

  for (let i = 0; i < countiesDirs.length; i++) {
    const countyDir = countiesDirs[i];
    const streetsPath = `${countyDir.path}/streets.geo.json`;
    await streaming.streamFeatureCollectionFile(streetsPath, handleFeature);
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
