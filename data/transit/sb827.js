const {
  stopTypes: {
    STOP_CLASS_MTS,
    STOP_CLASS_HFS,
    STOP_TYPE_MTS_FERRY,
    STOP_TYPE_MTS_RAIL,
    STOP_TYPE_HIGH_FREQUENCY_BUS,
    stopClassForStopTypes
  }
} = require("@aickin/visualize-density-common");

const TRANSIT_MIN_HEIGHT_LOW_FEET = 45;
const TRANSIT_MIN_HEIGHT_HIGH_FEET = 55;
const TRANSIT_MIN_HEIGHT_HIGH_FEET_WIDE_STREET = 85;
const WIDE_STREET_FEET = 70;

function rulesForTransitStopTypes(types) {
  switch (stopClassForStopTypes(types)) {
    case STOP_CLASS_MTS:
      return [
        {
          limits: {
            minHeightFeet: TRANSIT_MIN_HEIGHT_HIGH_FEET
          },
          radiusFeet: 1320 // 0.25 miles
        },
        {
          limits: {
            minHeightFeet: TRANSIT_MIN_HEIGHT_LOW_FEET
          },
          radiusFeet: 2640 // 0.5 miles
        }
      ];
    case STOP_CLASS_HFS:
      return [
        {
          limits: {
            minHeightFeet: TRANSIT_MIN_HEIGHT_HIGH_FEET
          },
          radiusFeet: 1320 // 0.25 miles
        }
      ];
    default:
      return [];
  }
}

module.exports = {
  TRANSIT_MIN_HEIGHT_LOW_FEET,
  TRANSIT_MIN_HEIGHT_HIGH_FEET,
  TRANSIT_MIN_HEIGHT_HIGH_FEET_WIDE_STREET,
  WIDE_STREET_FEET,

  rulesForTransitStopTypes
};
