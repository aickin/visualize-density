const jsts = require("jsts");

const geoJsonReader = new jsts.io.GeoJSONReader();
const geoJsonWriter = new jsts.io.GeoJSONWriter();

// unions together 0 or more polygons using jsts
module.exports = function unionPolygons(polygons) {
  const gf = new jsts.geom.GeometryFactory();

  const jstsPolygons = [];
  for (let i = 0; i < polygons.length; i++) {
    jstsPolygons.push(geoJsonReader.read(JSON.stringify(polygons[i].geometry)));
  }

  const jstsPolygonColl = gf.createGeometryCollection(jstsPolygons);

  const mergedPolygon = jstsPolygonColl.union();

  const result = geoJsonWriter.write(mergedPolygon);

  return {
    type: "Feature",
    geometry: result
  };
};
