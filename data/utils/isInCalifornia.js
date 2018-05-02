const turf = require("@turf/turf");
const california = require("../shapes/california.geo");

// checks to see if a particular lat/lng point is inside California.
module.exports = function isInCalifornia({ lat, lng }) {
  return turf.booleanPointInPolygon(turf.point([lng, lat]), california);
};
