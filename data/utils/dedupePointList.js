const turf = require("@turf/turf");

// we can get weird topology problems if our points are too close, so let's get
// merge any points that are different only after the 6th decimal point. that means
// the points would have to be about 10cm apart to be merged.
// see https://en.wikipedia.org/wiki/Decimal_degrees
module.exports = function(points) {
  const map = {};

  // TODO: deal with rest when there's a collision.
  points.forEach(({ lat, lng, types = [], ...rest }) => {
    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    map[key] = map[key] || {
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
      types: [],
      ...rest
    };

    map[key].types = Array.from(new Set([...map[key].types, ...types]));
  });

  return Object.values(map);
};
