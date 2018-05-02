const turf = require("@turf/turf");
const parse = require("csv-parse");
const fs = require("fs");
const ProgressLogger = require("../utils/progressLogger");
const SpatialIndex = require("../utils/spatialIndex");
const streaming = require("../utils/streaming");
const topology = require("../utils/topology");

const CENSUS_BLOCK_GROUP_FILE_PATH = `${__dirname}/input/california-block-groups.geo.json`;
const CENSUS_BLOCK_GROUP_INCOME_FILE_PATH = `${__dirname}/input/california-income-by-block-group.csv`;

class CensusEnricher {
  constructor() {
    this.name = "census";
    this._censusBlockGroupFeatures = new SpatialIndex(1);
  }

  // index census features
  async init() {
    console.log("Indexing census...");
    const logger = new ProgressLogger().start();

    await this._indexCensusFeatures(CENSUS_BLOCK_GROUP_FILE_PATH, logger, this._censusBlockGroupFeatures);

    this._incomeByBlockGroup = await this._indexIncomeByBlockGroup();

    logger.finish();
  }

  async _indexIncomeByBlockGroup() {
    const incomeTable = await this.parseFile(CENSUS_BLOCK_GROUP_INCOME_FILE_PATH);

    const incomeByBlockGroup = {};

    incomeTable.forEach(({["GEO.id2"]: id, HD01_VD01: income, HD02_VD01: moe}) => {
      // incomes are stored as "250,000+" if they are above 250K. Let's record
      // this as 250K so that we can do numerical comparisons.
      // also, some block groups don't have data, and instead have '-'.
      const incomeToStore = income === '250,000+' ? 250000 : income === '-' ? null : income;

      // when there's no income or MoE, it's denoted by "**". when the income
      // is "250,000+", then MoE is "***".
      const moeToStore = (moe === '**' || moe ==='***') ? null : moe;

      // the parsing guesses that the block group IDs are numbers and therefore strips off
      // the leading 0s.
      const idToUse = id.toString().padStart(12, '0');

      incomeByBlockGroup[idToUse] = { income: incomeToStore, moe: moeToStore };
    });

    return incomeByBlockGroup;
  }

  // very simple parsing of CSV file; returns a promise of an array of objects,
  // one per line of the CSV, with fields taken from the names in the first line.
  // (copied from Agency.js; think about refactoring out if you'd like.)
  parseFile(file, optional = false) {
    return new Promise((resolve, reject) => {
      const result = [];
      fs
        .createReadStream(file)
        .on("error", error => {
          if (error.code === "ENOENT" && optional) {
            // we didn't need this file; return an empty array.
            resolve([]);
          }
          reject(error);
        })
        .pipe(
          parse({
            auto_parse: true,
            columns: true,
            trim: true
          })
        )
        .on("data", data => result.push(data))
        .on("error", error => reject(error))
        .on("finish", () => resolve(result));
    });
  }

  // lookup census tract for a feature
  // - choose any point on the feature
  // - find a tract that contains this point
  async enrich({ feature }) {
    const blockGroups = await this._getCensusFeaturesForFeature(feature, this._censusBlockGroupFeatures);
    return {
      blockGroup: blockGroups.geoId,
      // blockGroupCount: blockGroups.count,
      // blockGroupAll: blockGroups.allGeoId,
      income: this._incomeByBlockGroup[blockGroups.geoId] || null,
    };
  }

  async _getCensusFeaturesForFeature(feature, index) {
    const searchBox = turf.bbox(feature);
    const potentialCensusFeatures = index.search(searchBox);

    // this is a quick way to check for an intersection.
    let tracts = potentialCensusFeatures.filter(t => {
      return !turf.booleanDisjoint(feature, t);
    });

    // if multiple tracts intersected, let's at least be deterministic about
    // which one we choose.
    if (tracts.length > 1) {
      tracts.sort((tractA, tractB) => {
        if (tractA.properties["GEOID"] === tractB.properties["GEOID"]) {
          return 0;
        }
        return tractA.properties["GEOID"] > tractB.properties["GEOID"] ? 1 : -1;
      })
    }

    return {
      geoId: tracts.length > 0 ? tracts[0].properties["GEOID"] : null,
      count: tracts.length,
      allGeoId: tracts.length > 0 ? tracts.map(t => t.properties["GEOID"]).join(",") : null,
    };
  }

  async _indexCensusFeatures(filePath, logger, index) {
    await streaming.streamFeatureCollectionFile(filePath, feature => {
      logger.increment();
      index.insert(feature);
    });
  }
}

module.exports = CensusEnricher;
