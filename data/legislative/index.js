const childProcess = require('child_process')
const fs = require('fs')

const queue = require('async.queue')
const tmp = require('tmp')
const turf = require("@turf/turf");
const {
  stopTypes: {
    STOP_CLASS_MTS,
    isHighFrequencyStopUnderCurrentSB827Text,
    stopClassForStopTypes
  }
} = require("@aickin/visualize-density-common");

const senateDistricts = require("./senate-districts.geo.json");
const assemblyDistricts = require("./assembly-districts.geo.json");

class Worker {
  constructor(forkFile, errMsg) {
    this.worker = childProcess.fork(forkFile)
    this.worker.on('message', message => {
      if (!message.success) {
        this.reject(errMsg)
      } else {
        this.resolve(message.data)
      }
      this.working = false
      this.queueCallback()
    })
    this.reject = null
    this.resolve = null
    this.working = false
    this.queueCallback = null
  }
}

// use a queue for calculating district info, because spawning hundreds of
// processes causes node to error
// keep processes open and reuse them
function makeWorkerQueue(forkFile, errMsg) {
  const childWorkers = []
  for (let i = 0; i < 10; i++) {
    childWorkers.push(new Worker(forkFile, errMsg))
  }

  const workerQueue = queue((task, callback) => {
    // find an available worker
    let childWorker
    for (let i = 0; i < childWorkers.length; i++) {
      childWorker = childWorkers[i]
      if (childWorker.working) {
        continue
      }
      childWorker.working = true
      break
    }
    childWorker.reject = task.reject
    childWorker.resolve = task.resolve
    childWorker.queueCallback = callback
    childWorker.worker.send(task.data)
  }, 10)

  // kill all childWorkers after done
  workerQueue.drain = () => {
    childWorkers.forEach(worker => {
      worker.worker.kill()
    })
  }

  return workerQueue
}

const districtInfoWorkerQueue = makeWorkerQueue(
  `${__dirname}/process-district-info-for-point.js`,
  'encountered error in `getDistrictInfoForPoint`'
)

// takes in a point and returns which Senate and Assembly districts the point is in.
function getDistrictInfoForPoint(point) {
  return new Promise((resolve, reject) => {
    districtInfoWorkerQueue.push({
      data: point,
      reject,
      resolve
    })
  })
}

function writeToTempFile(data) {
  const tmpobj = tmp.fileSync({ postfix: '.json' })
  fs.writeFileSync(tmpobj.name, JSON.stringify(data))
  return tmpobj.name
}

async function getDistrictAreaCoveredByStops(stops) {
  const mtsHighRisePolygonsFilename = writeToTempFile(
    stops
      .filter(({ types }) => stopClassForStopTypes(types) === STOP_CLASS_MTS)
      .map(stop => ({
        stop,
        poly: turf.circle([stop.lng, stop.lat], 0.25, { units: "miles" })
      }))
  );

  const mtsLowRisePolygonsFilename = writeToTempFile(
    stops
      .filter(({ types }) => stopClassForStopTypes(types) === STOP_CLASS_MTS)
      .map(stop => ({
        stop,
        poly: turf.circle([stop.lng, stop.lat], 0.5, { units: "miles" })
      }))
  );

  const busNoRisePolygonsFilename = writeToTempFile(
    stops
      .filter(isHighFrequencyStopUnderCurrentSB827Text)
      .map(stop => ({
        stop,
        poly: turf.circle([stop.lng, stop.lat], 0.25, { units: "miles" })
      }))
  );

  const workerQueue = makeWorkerQueue(
    `${__dirname}/process-district-areas.js`,
    'a district failed to caluclate'
  )

  const districtAreas = await Promise.all([
    sb827AreasInDistricts(workerQueue, senateDistricts, "senate", mtsHighRisePolygonsFilename, mtsLowRisePolygonsFilename, busNoRisePolygonsFilename),
    sb827AreasInDistricts(workerQueue, assemblyDistricts, "assembly", mtsHighRisePolygonsFilename, mtsLowRisePolygonsFilename, busNoRisePolygonsFilename)
  ])

  return {
    senate: districtAreas[0],
    assembly: districtAreas[1]
  }
}

// returns an object with total square mileage of each district, broken down by
// lowArea, highArea, and totalArea.
// -- lowArea is the number square miles subject to 45'/55' zoning.
// -- highArea is the number square miles subject to 55'/85' zoning.
// -- totalArea is the number square miles in the district.
async function sb827AreasInDistricts(
  workerQueue,
  districts,
  districtFieldName,
  mtsHighRisePolygonsFilename,
  mtsLowRisePolygonsFilename,
  busNoRisePolygonsFilename
) {
  const districtAreas = await Promise.all(districts.features.map(district =>
    new Promise(function(resolve, reject) {
      workerQueue.push({
        data: {
          districtFieldName,
          districtFilename: writeToTempFile(district),
          mtsHighRisePolygonsFilename,
          mtsLowRisePolygonsFilename,
          busNoRisePolygonsFilename
        },
        reject,
        resolve
      })
    })
  ))

  const allAreas = {};
  districtAreas.forEach(({name, highArea, lowArea, noArea, totalArea}) => {
    allAreas[name] = {highArea, lowArea, noArea, totalArea}
  })
  return allAreas;
}

module.exports = {
  getDistrictAreaCoveredByStops,
  getDistrictInfoForPoint
};
