const fs = require("fs");
const childProcess = require('child_process')
const jsts = require("jsts");
const turf = require("@turf/turf");

const Agency = require("./Agency");
const { convert } = require("@aickin/visualize-density-common");
const streaming = require("../utils/streaming");
const dedupePointList = require("../utils/dedupePointList");
const unionPolygons = require("../utils/unionPolygons");
const listDirectories = require("../utils/listDirectories");

const {
  stopTypes: {
    STOP_TYPE_MTS_FERRY,
    STOP_TYPE_MTS_RAIL,
    isHighFrequencyStopUnderCurrentSB827Text,
    stopClassForStopTypes
  }
} = require("@aickin/visualize-density-common");

const AGENCIES_DIR = `${__dirname}/agencies`;

async function run() {
  // process agencies

  const agencies = await Promise.all(
    listDirectories(AGENCIES_DIR)
      .map(subdir => subdir.name)
      .map(processAgency)
  )

  // calculate ferry stops close to bus or rail stops

  const ferryStops = getFerryStopsNearTransit(agencies).map(({ ...rest }) => ({
    ...rest,
    types: [STOP_TYPE_MTS_FERRY]
  }));

  // combine info

  console.log("[transit] Combining information...");

  // combine high frequency stops

  const highFrequencyStops = dedupePointList(agencies
    .map(agency => agency.highFrequencyStops)
    .reduce((prev, curr) => [...prev, ...curr], [])
    .filter(segment => !!segment));

  console.log(
    `[transit] ${highFrequencyStops.length} high frequency bus stops`
  );

  // combine high frequency segments
  const allSegments = agencies
    .map(agency => agency.allSegments)
    .reduce((prev, curr) => [...prev, ...curr], []);

  console.log(
    `[transit] ${allSegments.length} total bus segments`
  );

  // combine major transit stops

  const majorTransitStops = agencies
    .map(agency => agency.railMajorTransitStops)
    .reduce((prev, curr) => [...prev, ...curr], [])
    .concat(ferryStops)
    .filter(stop => !!stop);

  console.log(`[transit] ${majorTransitStops.length} major transit stops`);

  // de-duplicate

  const allStops = dedupePointList([
    ...highFrequencyStops,
    ...majorTransitStops
  ]);

  console.log(`[transit] ${allStops.length} stops after de-duplication.`);

  // combine polygons

  console.log("[transit] Combining all polygons...");

  // we need to filter highFrequencyStops because it has some stops that
  // are not peak commute hour high frequency.
  const highRisePolygon = unionPolygons(
    majorTransitStops.map(({ lat, lng }) =>
      turf.circle([lng, lat], 0.25, { units: "miles" })
    )
  );

  let lowRisePolygon = unionPolygons(
    majorTransitStops.map(({ lat, lng }) =>
      turf.circle([lng, lat], 0.5, { units: "miles" })
    )
  );

  let noRisePolygon = unionPolygons(
    highFrequencyStops.filter(isHighFrequencyStopUnderCurrentSB827Text).map(({ lat, lng }) =>
      turf.circle([lng, lat], 0.25, { units: "miles" })
    )
  );

  if (noRisePolygon && lowRisePolygon) {
    noRisePolygon = turf.difference(noRisePolygon, lowRisePolygon);
  }

  if (noRisePolygon && highRisePolygon) {
    // this won't actually do anything currently because with the current law
    // highRisePolygon is a strict subset of lowRisePolygon. I'm still adding it
    // in case the law changes.
    noRisePolygon = turf.difference(noRisePolygon, highRisePolygon);
  }

  // now, subtract out the high rise sections from the low rise poly
  if (lowRisePolygon && highRisePolygon) {
    lowRisePolygon = turf.difference(lowRisePolygon, highRisePolygon);
  }

  console.log("[transit] Combining all polygons complete.");

  // store output

  console.log("[transit] Writing output...");

  fs.writeFileSync(
    `${__dirname}/output/stops.geo.json`,
    streaming.stringifyFeatureCollection(
      convert.pointArrayToFeatureArray(allStops, props => {
        return { ...props, class: stopClassForStopTypes(props.types) };
      })
    )
  );

  fs.writeFileSync(
    `${__dirname}/output/highFrequencyStops.geo.json`,
    streaming.stringifyFeatureCollection(
      convert.pointArrayToFeatureArray(highFrequencyStops, props => {
        return { ...props, class: stopClassForStopTypes(props.types) };
      })
    )
  );

  fs.writeFileSync(
    `${__dirname}/output/noRisePolygon.geo.json`,
    streaming.stringifyFeatureCollection([noRisePolygon])
  );

  fs.writeFileSync(
    `${__dirname}/output/lowRisePolygon.geo.json`,
    streaming.stringifyFeatureCollection([lowRisePolygon])
  );

  fs.writeFileSync(
    `${__dirname}/output/highRisePolygon.geo.json`,
    streaming.stringifyFeatureCollection([highRisePolygon])
  );

  console.log("[transit] Writing output complete.");

  // return results

  return {
    noRisePolygon,
    lowRisePolygon,
    highRisePolygon,
    allSegments,
    allStops,
    agencyData: agencies.map(({ agencyName, debugDetails, stopNames }) => {
      return {
        agencyName,
        debugDetails,
        stopNames
      }
    })
  };
}

// process agencies in parellel
function processAgency(agencyName) {
  return new Promise((resolve, reject) => {
    const childWorker = childProcess.fork(`${__dirname}/process-agency`)
    childWorker.send(agencyName)
    childWorker.on('message', data => {
      if (!data.success) {
        return reject(`${agencyName} did not complete with success`)
      }
      const agencyOutputFile = `${__dirname}/output/${agencyName}.json`

      resolve(require(agencyOutputFile))

      // clean up and remove file
      fs.unlink(agencyOutputFile, () => {})
    })
  })
}

function makeStopDistanceFn(stop1) {
  return stop2 =>
    turf.distance(
      turf.point([stop1.lng, stop1.lat]),
      turf.point([stop2.lng, stop2.lat]),
      { units: "feet" }
    ) < 1000;
}

function getFerryStopsNearTransit(agencies) {
  const ferryStopsNearTransit = [];
  agencies.forEach(agency => {
    agency.ferryStops.forEach(ferryStop => {
      // try to find a stop close to a bus or rail stop of any other agency
      if (
        agencies.some(agency => {
          // check if agency bounds encapsulate ferry stop
          if (
            ferryStop.lat > agency.bounds.maxLat ||
            ferryStop.lat < agency.bounds.minLat ||
            ferryStop.lng > agency.bounds.maxLng ||
            ferryStop.lng < agency.bounds.minLng
          ) {
            // not within bounds of agency, skip
            return false;
          }
          // within bounds, check if within distance of each stop
          return (
            agency.railStops.some(makeStopDistanceFn(ferryStop)) ||
            agency.busStops.some(makeStopDistanceFn(ferryStop))
          );
        })
      ) {
        ferryStopsNearTransit.push(ferryStop);
      }
    });
  });
  console.log(
    `[transit] Found ${ferryStopsNearTransit.length} ferry stops near transit`
  );
  return ferryStopsNearTransit;
}

if (require.main === module) {
  run();
}

module.exports = {
  run
};
