const turf = require("@turf/turf");

const unionPolygons = require("../utils/unionPolygons");

const METERS_PER_MILE = 1609.34;

// these should all be the same, so don't import them each time
let mtsHighRisePolygons
let mtsLowRisePolygons
let busNoRisePolygons

// returns an object with total square mileage of each district, broken down by
// lowArea, highArea, and totalArea.
// -- lowArea is the number square miles subject to 45'/55' zoning.
// -- highArea is the number square miles subject to 55'/85' zoning.
// -- totalArea is the number square miles in the district.
process.on('message', message => {
  const {districtFieldName} = message
  // load in files
  district = require(message.districtFilename)
  // these should all be the same, so don't import them each time
  mtsHighRisePolygons = mtsHighRisePolygons || require(message.mtsHighRisePolygonsFilename)
  mtsLowRisePolygons = mtsLowRisePolygons || require(message.mtsLowRisePolygonsFilename)
  busNoRisePolygons = busNoRisePolygons || require(message.busNoRisePolygonsFilename)

  // if the stop is in the district or within a mile of the district, let's
  // try to intersect it with the district. doing this filter before intersecting
  // saves a LOT of time. note also that we specifically set the buffered district's
  // bbox because that makes the booleanPointInPolygon check very fast.
  let bufferedDistrict = turf.buffer(district, 1, {units: "miles"});
  bufferedDistrict = {
    bbox: turf.bbox(bufferedDistrict),
    ...bufferedDistrict
  };

  const isStopNearDistrict = ({stop}) => {
    return stop[districtFieldName] === parseInt(district.properties.NAME) ||
      turf.booleanPointInPolygon([stop.lng, stop.lat], bufferedDistrict);
  };

  const mtsHighIntersections = mtsHighRisePolygons
    .filter(isStopNearDistrict)
    .map(({poly}) => intersect(district, poly))
    .filter(intersection => !!intersection)
    .map(poly => turf.truncate(poly));

  const mtsLowIntersections = mtsLowRisePolygons
    .filter(isStopNearDistrict)
    .map(({poly}) => intersect(district, poly))
    .filter(intersection => !!intersection)
    .map(poly => turf.truncate(poly));

  const busNoIntersections = busNoRisePolygons
      .filter(isStopNearDistrict)
      .map(({poly}) => intersect(district, poly))
      .filter(intersection => !!intersection)
      .map(poly => turf.truncate(poly));

  const allHighIntersections = union(mtsHighIntersections);

  const allLowIntersections = difference(union(mtsLowIntersections), allHighIntersections);

  let allNoIntersections = null;
  if (busNoIntersections.length > 0) {
    allNoIntersections = union(busNoIntersections);
    if (allLowIntersections) {
      allNoIntersections = difference(allNoIntersections, allLowIntersections);
    }
    if (allHighIntersections) {
      allNoIntersections = difference(allNoIntersections, allHighIntersections);
    }
  }

  const highArea = allHighIntersections ? turf.area(allHighIntersections) / (METERS_PER_MILE * METERS_PER_MILE) : 0;
  const lowArea = allLowIntersections ? turf.area(allLowIntersections) / (METERS_PER_MILE * METERS_PER_MILE) : 0;
  const noArea = allNoIntersections ? turf.area(allNoIntersections) / (METERS_PER_MILE * METERS_PER_MILE) : 0;
  const totalArea = turf.area(district) / (METERS_PER_MILE * METERS_PER_MILE)

  process.send({
    data: { name: district.properties.NAME, highArea, lowArea, noArea, totalArea },
    success: true
  })
})

function difference(poly1, poly2) {
  return retryWithBuffer(turf.difference, "difference", poly1, poly2);
}

function union(polys) {
  return retryWithBuffer((...polys) => unionPolygons(polys), "unionPolygons", ...polys);
}

function intersect(district, stop) {
  return retryWithBuffer(totalIntersection, "totalIntersection", district, stop);
}

// tries an operation on a list of polygons. if the operation fails, it buffers
// all the polygons by a centimeter and tries again.
function retryWithBuffer(operation, opName, ...polys) {
  try {
    return operation(...polys);
  } catch(e) {
    // sometimes buffer returns a FeatureCollection that has an empty array of
    // features. we need to filter those out.
    const isNotEmptyFeatureCollection = fc => true; //fc.type !== "FeatureCollection" || fc.features.length > 0

    console.warn(`Error calling ${opName} on polygons; trying again with 1cm buffer.`);
    // if this one errors, let it happen.
    try {
    return operation(...polys.map(p => turf.buffer(p, 0.01, {units: "meters"})).filter(isNotEmptyFeatureCollection));
  } catch(e) {
    debugger;
    throw e;
  }
  }
}

// it's silly, but for some reason, turf.intersect() seems to only intersect the
// first polygons of a multipolygon. this function takes in two features, which
// can each be either Polygon or MultiPolygon and gives the intersecting area.
function totalIntersection(feature1, feature2) {
  const polygonArray1 = featureToPolygonArray(feature1);
  const polygonArray2 = featureToPolygonArray(feature2);

  const allIntersections = [];
  polygonArray1.forEach(poly1 => {
    polygonArray2.forEach(poly2 => {
      const intersection = turf.intersect(poly1, poly2);
      if (intersection) {
        allIntersections.push(intersection);
      }
    });
  });

  return allIntersections.length > 0 ? union(allIntersections) : null;
}

function featureToPolygonArray(feature) {
  if (feature.geometry.type === "Polygon") {
    return [feature];
  }

  if (feature.geometry.type === "MultiPolygon") {
    return feature.geometry.coordinates.map(coordinates => turf.polygon(coordinates));
  }

  throw new Error(`The geometry sent to featureToPolygonArray must be either Polygon or MultiPolygon type, but it was ${feature.geometry.type}.`);
}
