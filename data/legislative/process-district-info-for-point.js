const turf = require("@turf/turf");

const senateDistricts = require("./senate-districts.geo.json");
const assemblyDistricts = require("./assembly-districts.geo.json");

// takes in a point and returns which Senate and Assembly districts the point is in.
process.on('message', function(point) {
  const senateDistrictsWithThisPoint = getDistrictsWithPoint(
    senateDistricts,
    point
  );
  // there should always be exactly one senate district with each point; let's throw an
  // error if not.
  if (senateDistrictsWithThisPoint.length === 0) {
    throw new Error(
      `The point (${lat}, ${lng}) does not seem to be in any Senate district.`
    );
  }
  if (senateDistrictsWithThisPoint.length > 1) {
    throw new Error(
      `The point (${lat}, ${lng}) seems to be in multiple Senate districts: ${senateDistrictsWithThisPoint
        .map(district => district.properties.NAME)
        .join(", ")}`
    );
  }

  const assemblyDistrictsWithThisPoint = getDistrictsWithPoint(
    assemblyDistricts,
    point
  );
  // there should always be exactly one assembly district with each point; let's throw an
  // error if not.
  if (assemblyDistrictsWithThisPoint.length === 0) {
    throw new Error(
      `The point (${lat}, ${lng}) does not seem to be in any Assembly district.`
    );
  }
  if (assemblyDistrictsWithThisPoint.length > 1) {
    throw new Error(
      `The point (${lat}, ${lng}) seems to be in multiple Assembly districts: ${assemblyDistrictsWithThisPoint
        .map(district => district.properties.NAME)
        .join(", ")}`
    );
  }

  process.send({
    data: {
      senate: parseInt(senateDistrictsWithThisPoint[0].properties.NAME),
      assembly: parseInt(assemblyDistrictsWithThisPoint[0].properties.NAME)
    },
    success: true
  })
})

// returns an array of the districts that contain this point. for any point inside
// California, this should only return exactly one district, but geo data can be
// wonky, so it returns an array.
function getDistrictsWithPoint(districts, { lat, lng }) {
  const point = turf.point([lng, lat]);

  let districtsWithThisPoint = districts.features.filter(district =>
    turf.booleanPointInPolygon(point, district.geometry)
  );

  if (districtsWithThisPoint.length === 0) {
    // a couple ferry stops are sliiiiiightly outside the legislature district
    // shapefile boundaries because they are out on a pier in the water. Try to
    // buffer the districts and see if we can catch those districts.
    districtsWithThisPoint = districts.features.filter(district =>
      turf.booleanPointInPolygon(
        point,
        turf.buffer(district, 100, { units: "meters" })
      )
    );
  }

  return districtsWithThisPoint;
}
