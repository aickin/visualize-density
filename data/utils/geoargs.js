// Helper functions to accept & parse bounding box args
// via the command line, specified by point + "radius"

const turf = require("@turf/turf");

function addBBoxArgs(parser) {
  parser.addArgument(["-p", "--point"], { help: "lng,lat" });
  parser.addArgument(["-r", "--radius"], { type: "float", help: "in miles" });
}

function bboxFromArgs(args) {
  if (!args.point) {
    return null;
  }
  const point = turf.point(args.point.split(",").map(str => parseFloat(str)));
  const radius = args.radius || DEFAULT_RADIUS_MILES;
  return turf.bbox(turf.buffer(point, radius, { units: "miles" }));
}

module.exports = {
  addBBoxArgs,
  bboxFromArgs
};
