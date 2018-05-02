// this is a script that finds the 6 most populous census-designated places for
// each California Senate and Assembly district. It only finds places with a
// population of >10,000. Also, if a city is only partly in the leg district,
// the script discounts the population by the percent of the city's area that
// is in the district. So if a city has 200,000 people but only one quarter of the
// city land mass is in the district, this script counts it as 50,000 population.
// This script is very slow and unoptimized (takes ~20m on my box), but that's
// basically fine, because I don't plan to ever run it again.
const fs = require("fs");
const parse = require("csv-parse");
const turf = require("@turf/turf");

const senateDistricts = require("../legislative/senate-districts.geo");
const assemblyDistricts = require("../legislative/assembly-districts.geo");
const californiaPlaces = require("./california-places.geo");
const californiaPopulation = require("./california-places-population");

const populationByPlaceId = {};

// index the population file by fips code.
californiaPopulation.forEach(({ PLACE, POPESTIMATE2016 }) => {
  populationByPlaceId[PLACE] = POPESTIMATE2016;
});

// sort the senate geo JSONs by district id to make the printout in order.
senateDistricts.features.sort((a, b) => {
  if (parseInt(a.properties.NAME) > parseInt(b.properties.NAME)) return 1;
  if (parseInt(b.properties.NAME) > parseInt(a.properties.NAME)) return -1;
  return 0;
});

console.log("SENATE");
console.log("======");

senateDistricts.features.forEach(printDistrict);

// sort the assembly geo JSONs by district id to make the printout in order.
assemblyDistricts.features.sort((a, b) => {
  if (parseInt(a.properties.NAME) > parseInt(b.properties.NAME)) return 1;
  if (parseInt(b.properties.NAME) > parseInt(a.properties.NAME)) return -1;
  return 0;
});

console.log("\nASSEMBLY");
console.log("========");

assemblyDistricts.features.forEach(printDistrict);

// for one district poly/multipoly feature, check every census designated place in
// California and see if they overlap. print out the (up to) 6 most populous.
function printDistrict(district) {
  const cities = californiaPlaces.features
    .filter(feature => !turf.booleanDisjoint(district, feature))
    .map(feature => {
      // if the city is only partly in the district, then reduce the effective
      // population.
      let overlapArea = totalOverlap(district, feature);
      const cityArea = turf.area(feature);
      const totalPopulation =
        populationByPlaceId[parseInt(feature.properties.PLACEFP)];

      return {
        name: feature.properties.NAME,
        population: totalPopulation
          ? overlapArea / cityArea * totalPopulation
          : undefined
      };
    })
    .filter(({ population }) => !!population && population > 10000); // filter out little slivers of towns

  // sort the cities so that the most populous come first.
  cities.sort((a, b) => {
    if (a.population > b.population) return -1;
    if (b.population > a.population) return 1;
    return 0;
  });

  // print out the first 6 city names.
  const result = cities
    .filter((_, i) => i < 6)
    .map(city => city.name)
    .join(", ");

  console.log(`district ${district.properties.NAME}: ${result}`);
}

// it's silly, but for some reason, turf.intersect() seems to only intersect the
// first polygons of a multipolygon. this function takes in two features, which
// can each be either Polygon or MultiPolygon and gives the intersecting area.
function totalOverlap(feature1, feature2) {
  if (
    feature1.geometry.type === "Polygon" &&
    feature2.geometry.type === "Polygon"
  ) {
    const intersection = turf.intersect(feature1, feature2);
    if (intersection) {
      return turf.area(intersection);
    }
    return 0;
  }

  if (feature1.geometry.type === "MultiPolygon") {
    let result = 0;

    feature1.geometry.coordinates.forEach(coordinates => {
      result += totalOverlap(turf.polygon(coordinates), feature2);
    });
    return result;
  }

  if (feature2.geometry.type === "MultiPolygon") {
    let result = 0;

    feature2.geometry.coordinates.forEach(coordinates => {
      result += totalOverlap(feature1, turf.polygon(coordinates));
    });
    return result;
  }
}
