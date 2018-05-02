const turf = require("@turf/turf");

// polygon helpers

function featureIsPolygon(feature) {
  return feature.geometry.type === "Polygon";
}

function multiPolygon(feature) {
  if (featureIsPolygon(feature)) {
    return {
      ...feature,
      geometry: {
        type: "MultiPolygon",
        coordinates: [feature.geometry.coordinates]
      }
    };
  }
  return feature;
}

function polygonsForFeature(feature) {
  const geom = feature.geometry;
  switch (geom.type) {
    case "Polygon":
      return [geom];
    case "MultiPolygon":
      return geom.coordinates.map(c => ({ type: "Polygon", coordinates: c }));
    default:
      throw new Error("Unsupported geometry type", geom.type);
  }
}

// sharesArea (overlaps OR is contained)

function polygonsShareArea(smallPolygon, largePolygon) {
  return (
    turf.booleanContains(largePolygon, smallPolygon) ||
    turf.booleanOverlap(smallPolygon, largePolygon)
  );
}

function sharesArea(smallFeature, largeFeature) {
  if (featureIsPolygon(smallFeature) && featureIsPolygon(largeFeature)) {
    return polygonsShareArea(smallFeature, largeFeature);
  }
  for (let smallPolygon of polygonsForFeature(smallFeature)) {
    for (let largePolygon of polygonsForFeature(largeFeature)) {
      if (polygonsShareArea(smallPolygon, largePolygon)) {
        return true;
      }
    }
  }
  return false;
}

// containsPoint (because turf doesn't support multi-polygons)

function polygonContainsPoint(polygon, point) {
  return turf.booleanContains(polygon, point);
}

function containsPoint(feature, point) {
  if (featureIsPolygon(feature)) {
    return polygonContainsPoint(feature, point);
  }
  return !!polygonsForFeature(feature).find(polygon =>
    polygonContainsPoint(polygon, point)
  );
}

module.exports = {
  sharesArea,
  containsPoint,
  multiPolygon
};
