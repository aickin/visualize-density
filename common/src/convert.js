const fs = require("fs");
const readline = require("readline");

const FEET_TO_METERS = 0.3048;
const SQFEET_TO_SQMETERS = FEET_TO_METERS * FEET_TO_METERS;
const HECTARES_TO_ACRES = 10000 / SQFEET_TO_SQMETERS / (660 * 66);

function polygonToPointArray(polygon) {
  switch (polygon.geometry.type) {
    case "Polygon":
      return polygonCoordinatesToPointArray(polygon.geometry.coordinates);
    case "MultiPolygon":
      return polygon.geometry.coordinates.map(polygonCoordinatesToPointArray).reduce((prev, curr) => [...prev, ...curr], []);
  }
}

function polygonCoordinatesToPointArray(polygonCoordinates) {
  return polygonCoordinates.map(linearRing => linearRing.map(([lng, lat]) => ({ lat, lng })));
}

function geometryCollectionToPointArray(geometryCollection) {
  return geometryCollection.geometries.map(geometry => {
    let coordinates = geometry.coordinates;
    switch (geometry.type) {
      case "MultiLineString":
        coordinates = Array.prototype.concat(...coordinates);
      default:
        break;
    }
    return coordinates.map(([lng, lat]) => ({ lat, lng }));
  });
}

function pointArrayToFeatureArray(points, propMapper) {
  return points.map(point => {
    const { lat, lng, ...properties } = point;
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lng, lat]
      },
      properties: propMapper ? propMapper(properties) : properties
    };
  });
}

function segmentArrayToFeatureArray(segments) {
  return segments.map(segment => {
    const { from, to, ...properties } = segment;
    return {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [[from.lng, from.lat], [to.lng, to.lat]]
      },
      properties
    };
  });
}

module.exports = {
  FEET_TO_METERS,
  HECTARES_TO_ACRES,

  polygonToPointArray,
  geometryCollectionToPointArray,
  pointArrayToFeatureArray,
  segmentArrayToFeatureArray
};
