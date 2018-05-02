const turf = require("@turf/turf");
const ProgressLogger = require("../utils/progressLogger");
const SpatialIndex = require("../utils/spatialIndex");
const streaming = require("../utils/streaming");
const topology = require("../utils/topology");

const CITIES_FILE_PATH = `${__dirname}/california-places.geo.json`;

class CityEnricher {
  constructor() {
    this.name = "city";
    this._cityFeatures = new SpatialIndex(1);
  }

  // index city features
  async init() {
    console.log("Indexing cities...");
    const logger = new ProgressLogger().start();

    await streaming.streamFeatureCollectionFile(CITIES_FILE_PATH, feature => {
      logger.increment();
      this._cityFeatures.insert(feature);
    });

    logger.finish();
  }

  // lookup city for a feature
  // - choose any point on the feature
  // - find a city that contains this point
  async enrich({ feature }) {
    const point = turf.pointOnFeature(feature);
    const searchBox = turf.bbox(point);
    const city = this._cityFeatures.search(searchBox).find(t => {
      return topology.containsPoint(t, point);
    });

    return {
      name: city ? city.properties["NAME"] : null
    };
  }
}

module.exports = CityEnricher;
