const turf = require("@turf/turf");
const ProgressLogger = require("../utils/progressLogger");
const SpatialIndex = require("../utils/spatialIndex");
const streaming = require("../utils/streaming");
const topology = require("../utils/topology");
const sb827 = require("./sb827");

const {
  stopTypes: {
    STOP_TYPE_HIGH_FREQUENCY_BUS,
    STOP_TYPE_MTS_FERRY,
    STOP_TYPE_MTS_RAIL
  }
} = require("@aickin/visualize-density-common");

const STOPS_FILE_PATH = `${__dirname}/output/stops.geo.json`;

class SB827Enricher {
  constructor() {
    this.name = "sb827";
    this._transitFeatures = new SpatialIndex();
  }

  // index transit stops
  // - draw circles around each stop
  // - store the sb827 limits for the circle regions
  async init() {
    console.log("Indexing transit...");
    const logger = new ProgressLogger().start();

    await streaming.streamFeatureCollectionFile(STOPS_FILE_PATH, feature => {
      logger.increment();
      const rules = sb827.rulesForTransitStopTypes(feature.properties.types);
      rules.forEach(rule => {
        const circle = turf.circle(feature, rule.radiusFeet, {
          properties: { limits: rule.limits },
          units: "feet",
          steps: 64
        });
        this._transitFeatures.insert(circle);
      });
    });

    logger.finish();
  }

  // lookup sb827 limits for a feature
  // - intersect the feature with transit circles
  // - find the most lenient overlapping rules
  enrich({ feature }) {
    let limits = null;
    const bbox = turf.bbox(feature);
    this._transitFeatures.search(bbox).some(circle => {
      if (topology.sharesArea(feature, circle)) {
        limits = circle.properties.limits;
        if (limits.minHeightFeet >= sb827.TRANSIT_MIN_HEIGHT_HIGH_FEET) {
          return true; // can't go any higher
        }
      }
    });

    const zoning = feature.properties.zoning;
    const existingMaxHeightFeet = zoning ? zoning.maxHeightFeet : null;

    const street = feature.properties.street;
    const streetWidth = street ? street.width : null;

    let minMaxHeightFeet = null;
    if (limits) {
      if (
        limits.minHeightFeet === sb827.TRANSIT_MIN_HEIGHT_HIGH_FEET &&
        streetWidth >= sb827.WIDE_STREET_FEET
      ) {
        minMaxHeightFeet = sb827.TRANSIT_MIN_HEIGHT_HIGH_FEET_WIDE_STREET;
      } else {
        minMaxHeightFeet = limits.minHeightFeet;
      }
    }

    let deltaHeightFeet = null;
    if (minMaxHeightFeet && existingMaxHeightFeet) {
      deltaHeightFeet = minMaxHeightFeet - existingMaxHeightFeet;
      deltaHeightFeet = Math.max(0, deltaHeightFeet);
    }

    return {
      minMaxHeightFeet,
      deltaHeightFeet
    };
  }
}

module.exports = SB827Enricher;
