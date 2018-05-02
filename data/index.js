const fs = require("fs");
const jsts = require("jsts");
const turf = require("@turf/turf");

const transit = require("./transit");
const legislative = require("./legislative");
const { convert } = require("@aickin/visualize-density-common");
const runTime = require('./utils/runTime')

main();

async function main() {
  const startTime = new Date()

  // gather raw data

  const {
    noRisePolygon,
    lowRisePolygon,
    highRisePolygon,
    allStops,
    allSegments,
    agencyData
  } = await transit.run();

  const transitRunEndTime = new Date()

  runTime('[transit] transit.run', startTime, transitRunEndTime)

  // generate public site data

  console.log("[site] Writing polygons...");

  if (!fs.existsSync(`${__dirname}/output`)) {
    fs.mkdirSync(`${__dirname}/output`);
  }

  fs.writeFileSync(
    `${__dirname}/../site/public/all_segments.json`,
    JSON.stringify(allSegments)
  );

  fs.writeFileSync(
    '../private-site/public/agency-data.json',
    JSON.stringify(agencyData)
  );

  fs.writeFileSync(
    `${__dirname}/output/no_rise_shape.json`,
    JSON.stringify(convert.polygonToPointArray(turf.truncate(noRisePolygon)))
  );

  fs.writeFileSync(
    `${__dirname}/output/low_rise_shape.json`,
    JSON.stringify(convert.polygonToPointArray(turf.truncate(lowRisePolygon)))
  );

  fs.writeFileSync(
    `${__dirname}/output/high_rise_shape.json`,
    JSON.stringify(convert.polygonToPointArray(turf.truncate(highRisePolygon)))
  );

  console.log("[site] Writing complete.");

  const siteRunEndTime = new Date()

  runTime('[site] output writing', transitRunEndTime, siteRunEndTime)

  // generate private site data

  console.log("[private-site] Writing stops...");

  async function addDistrictInfo(stop) {
    return {
      ...stop,
      ...await legislative.getDistrictInfoForPoint({ lat: stop.lat, lng: stop.lng })
    };
  }

  const stops = await Promise.all(allStops.map(addDistrictInfo));

  fs.writeFileSync(`${__dirname}/output/stops.json`, JSON.stringify(stops));

  const privateSiteStopEndTime = new Date()

  runTime(
    '[private-site] district info per stop caluclations',
    siteRunEndTime,
    privateSiteStopEndTime
  )

  console.log("[private-site] Writing coastal zone...");

  const coastalZoneFilePath = `./shapes/coastal-zone.geo.json`;
  const coastalZoneGeometryCollection = JSON.parse(
    fs.readFileSync(coastalZoneFilePath, "utf8")
  );

  fs.writeFileSync(
    "../private-site/src/data/coastal-zone-paths.json",
    JSON.stringify(
      convert.geometryCollectionToPointArray(coastalZoneGeometryCollection)
    )
  );
  console.log("[private-site] Writing complete.");

  const coastalZoneEndTime = new Date()

  runTime(
    '[private-site] coastal zone caluclations',
    privateSiteStopEndTime,
    coastalZoneEndTime
  )

  console.log("[district-site] Calculating per-district intersections...");

  const {
    senate: senateAreas,
    assembly: assemblyAreas
  } = await legislative.getDistrictAreaCoveredByStops(stops);
  fs.writeFileSync(
    `${__dirname}/output/senate-districts-sb827-area.json`,
    JSON.stringify(senateAreas)
  );
  fs.writeFileSync(
    `${__dirname}/output/assembly-districts-sb827-area.json`,
    JSON.stringify(assemblyAreas)
  );

  console.log("[district-site] Writing complete.");

  runTime(
    '[district-site] district site caluclations',
    coastalZoneEndTime,
    new Date()
  )
}
