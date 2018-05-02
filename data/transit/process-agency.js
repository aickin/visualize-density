const fs = require('fs')

const Agency = require("./Agency");
const dedupePointList = require("../utils/dedupePointList");
const isInCalifornia = require("../utils/isInCalifornia");

const {
  stopTypes: {
    STOP_TYPE_MTS_RAIL,
    STOP_TYPE_MTS_BUS
  }
} = require("@aickin/visualize-density-common");

const AGENCIES_DIR = `${__dirname}/agencies`;

// given an agency name, this function analyzes the transit agency data and
// calculates an object with following properties:
//
// bounds: the bounds of the agnecy,
// busStops: a list of all bus stops at the agency
// railStops: a list of all rail stops at the agency
// ferryStops: a list of all ferry stops at the agency
// railMajorTransitStops: a list of all major rail stops at the agency
// busMajorTransitStops: a list of all major bus stops at the agency
// highFrequencyStops: a list of all high frequency bus stops at the agency
// allPeakCommuteSegments: a list of all peak commute segments at the agency
// routeDetails: debugging details for each route
// stopsByStopId: all stops by stopId
// agencyName: the folder name of the agency
process.on('message', async function(agencyName) {
  const logPrefix = `transit/${agencyName}`;

  console.log(`[${logPrefix}] Parsing...`);

  const agency = await Agency.fromDirectory(`${AGENCIES_DIR}/${agencyName}`);
  console.log(`[${logPrefix}] Parse complete.`);

  console.log(`[${logPrefix}] Finding rail major transit stations...`);
  const railMajorTransitStops = dedupePointList(
    agency
      .getRailMajorTransitStops()
      .filter(isInCalifornia)
      .map(({ ...rest }) => ({
        ...rest,
        types: [STOP_TYPE_MTS_RAIL]
      }))
  );
  console.log(
    `[${logPrefix}] Found ${
      railMajorTransitStops.length
    } rail major transit stations.`
  );

  console.log(`[${logPrefix}] Finding high frequency bus stops...`);
  const highFrequencyStops = agency
    .getHighFrequencyStops()
    .filter(isInCalifornia);
  console.log(
    `[${logPrefix}] Found ${
      highFrequencyStops.length
    } high frequency bus stops.`
  );

  console.log(`[${logPrefix}] Finding all peak commute times...`);
  const allSegments = agency
    .getAllBusTripSegments();

  console.log(
    `[${logPrefix}] Found ${
      allSegments.length
    } bus segments.`
  );

  if (agency.noService) {
    console.warn(`[${logPrefix}] No service active on target date!!!!!!`)
  }

  const stopNames = {}
  Object.entries(agency.stopsByStopId).map(([stopId, {stop_name}]) => {
    stopNames[stopId] = stop_name
  })

  // write the results to a file because the response is too big to send back
  // via process.send message
  // this could potentially be re-written to use shared memory
  fs.writeFileSync(
    `${__dirname}/output/${agencyName}.json`,
    JSON.stringify({
      bounds: bufferBounds(agency.bounds),
      busStops: agency.busStops,
      railStops: agency.railStops,
      ferryStops: agency.ferryStops,
      railMajorTransitStops,
      highFrequencyStops,
      allSegments,
      debugDetails: agency.debugDetails,
      stopNames,
      agencyName
    })
  )

  console.log(`[${logPrefix}] finished`)

  process.send({
    success: true
  })
  process.disconnect()
})

// add a little bit extra to the bounds to allow searching with a 1500ft of
// all stops
function bufferBounds(bounds) {
  return {
    minLat: bounds.minLat - 0.005,
    minLng: bounds.minLng - 0.005,
    maxLat: bounds.maxLat + 0.005,
    maxLng: bounds.maxLng + 0.005
  };
}
