const turf = require("@turf/turf");
const db = require("../utils/db");

const {
  FEET_TO_METERS,
  HECTARES_TO_ACRES
} = require("@aickin/visualize-density-common").convert;

const { ZONING_TABLE } = require("./model");

class ZoningEnricher {
  constructor() {
    this.name = "zoning";
  }

  async init() {
    // noop
  }

  // lookup zoning for a feature
  // - choose any point on the feature
  // - find a zone that contains this point
  async enrich({ feature }) {
    const point = turf.pointOnFeature(feature);
    const zones = await db.queryFeaturesAtPoint(ZONING_TABLE, point);

    const zone = zones[0];

    const {
      zone: zoneName,
      singleFamily,
      multiFamily,
      hiMaxHeightMeters,
      hiMinParkingPerUnit,
      loMaxUnitsPerLot,
      loMaxUnitsPerHectare
    } = zone ? zone.properties : {};

    // height

    let maxHeightFeet = null;
    if (hiMaxHeightMeters) {
      maxHeightFeet = Math.round(hiMaxHeightMeters / FEET_TO_METERS);
    }

    // parking

    let minParkingPerUnit = null;
    if (hiMinParkingPerUnit) {
      minParkingPerUnit = hiMinParkingPerUnit;
    }

    // density

    let maxUnitsPerLot = null;
    if (loMaxUnitsPerLot) {
      maxUnitsPerLot = loMaxUnitsPerLot;
    }

    let maxUnitsPerHectare = null;
    if (loMaxUnitsPerHectare) {
      maxUnitsPerHectare = loMaxUnitsPerHectare;
    }

    let maxUnits = maxUnitsPerLot;
    if (maxUnitsPerHectare) {
      const { area } = feature.properties;
      const maxUnitsPerSquareMeter = maxUnitsPerHectare / 10000;
      const maxUnitsByDensity = Math.floor(area * maxUnitsPerSquareMeter);
      maxUnits = maxUnitsPerLot
        ? Math.min(maxUnitsPerLot, maxUnitsByDensity)
        : maxUnitsByDensity;
      // round up to 1, this usually makes sense
      maxUnits = Math.max(maxUnits, 1);
    }

    // combine

    return {
      zone: zoneName || "N/A",
      maxHeightFeet: maxHeightFeet,
      minParkingPerUnit: minParkingPerUnit,
      maxUnitsPerLot: maxUnitsPerLot,
      maxUnitsPerHectare: maxUnitsPerHectare,
      maxUnits: maxUnits,
      singleFamily: singleFamily === "yes",
      multiFamily: multiFamily === "yes"
    };
  }
}

module.exports = ZoningEnricher;
