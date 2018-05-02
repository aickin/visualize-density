const parse = require("csv-parse");
const uuid = require("node-uuid");
const turf = require("@turf/turf");
const fs = require("fs");
const dedupePointList = require("../utils/dedupePointList");

const {
  stopTypes: {
    STOP_TYPE_MTS_FERRY,
    STOP_TYPE_MTS_RAIL,
    STOP_TYPE_HIGH_FREQUENCY_BUS,
    STOP_TYPE_HIGH_FREQUENCY_BUS_6X_7AM_6PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_6X_7AM_8PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_6X_7AM_10PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_5X_7AM_6PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_5X_7AM_8PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_5X_7AM_10PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_6PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_8PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_10PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_3X_7AM_6PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_3X_7AM_8PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_3X_7AM_10PM,

    STOP_TYPE_HIGH_FREQUENCY_BUS_6X_6AM_6PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_6X_6AM_8PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_6X_6AM_10PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_5X_6AM_6PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_5X_6AM_8PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_5X_6AM_10PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_6PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_8PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_10PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_3X_6AM_6PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_3X_6AM_8PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_3X_6AM_10PM,

    // types needed for amendments 2018-04-09.
    // My understanding of the amendments is that to qualify a segment requires any one of the following four time frames,
    // plus the weekend time frames, plus 3X_6AM_10PM
    STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_9AM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_10AM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_4X_3PM_6PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_4X_4PM_7PM,

    STOP_TYPE_HIGH_FREQUENCY_BUS_SATURDAY_2X_8AM_10PM,
    STOP_TYPE_HIGH_FREQUENCY_BUS_SUNDAY_2X_8AM_10PM,

    stopClassForStopTypes
  }
} = require("@aickin/visualize-density-common");

// enum for peak peak commute times.
const AM_PEAK = "AM";
const PM_PEAK = "PM";
const NOT_PEAK = null;

// the day that we use to check high frequency service.
const BENCHMARK_DATES = {
  weekday: {
    date: 20180108,
    dayOfWeek: 'monday'
  },
  saturday: {
    date: 20180106,
    dayOfWeek: 'saturday'
  },
  sunday: {
    date: 20180107,
    dayOfWeek: 'sunday'
  }
}

class TimeOfDay {
  constructor(timeStr) {
    this.time = TimeOfDay.strToTime(timeStr);
  }

  gt(otherTimeStr) {
    return this.time > TimeOfDay.strToTime(otherTimeStr);
  }

  lt(otherTimeStr) {
    return this.time < TimeOfDay.strToTime(otherTimeStr);
  }

  gte(otherTimeStr) {
    return !this.lt(otherTimeStr);
  }

  lte(otherTimeStr) {
    return !this.gt(otherTimeStr);
  }

  static _strToArray(str) {
    const result = str.split(":").map(digit => parseInt(digit));
    if (result.length !== 3) {
      throw new Error(`Time '${str}' is not a valid GTFS time.`);
    }
    return result;
  }

  static hour(str) {
    const result = TimeOfDay._strToArray(str);
    return result[0];
  }

  static minute(str) {
    const result = TimeOfDay._strToArray(str);
    return result[1];
  }

  static second(str) {
    const result = TimeOfDay._strToArray(str);
    return result[2];
  }

  static strToTime(str) {
    const result = TimeOfDay._strToArray(str);
    return result[0] * 60 * 60 + result[1] * 60 + result[2];
  }

  static timeToStr(time) {
    const hours = Math.floor(time / (60 * 60));
    time -= hours * 60 * 60;
    const minutes = Math.floor(time / 60);
    time -= minutes * 60;
    const seconds = Math.floor(time);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
}

function getPeakType(timeStr) {
  const time = new TimeOfDay(timeStr);

  if (time.gte("6:30:00") && time.lt("8:30:00")) {
    return AM_PEAK;
  } else if (time.gte("16:30:00") && time.lt("18:30:00")) {
    return PM_PEAK;
  }
  return NOT_PEAK;
}

// sometimes there is no arrival_time or departure_time in a stop_time and we have
// to interpolate. this function, given a **sorted** list of stop_times and an index,
// will give back a departure_time string. according to the gtfs spec, the first and last
// stops have to have both arrival_time and departure_time.
function getDepartureTimeForStopTime(stopTimes, i) {
  return getTimeForStopTime(stopTimes, i, "departure_time");
}

function getArrivalTimeForStopTime(stopTimes, i) {
  return getTimeForStopTime(stopTimes, i, "arrival_time");
}

function getTimeForStopTime(stopTimes, i, field) {
  if (stopTimes[i][field]) {
    return stopTimes[i][field];
  }
  // find the previous stop time that has a departure_time.
  let previous;
  for (previous = i; previous >= 0; previous--) {
    if (stopTimes[previous][field]) {
      break;
    }
  }

  let next;
  for (next = i; next < stopTimes.length; next++) {
    if (stopTimes[next][field]) {
      break;
    }
  }

  const interval =
    TimeOfDay.strToTime(stopTimes[next][field]) -
    TimeOfDay.strToTime(stopTimes[previous][field]);
  return TimeOfDay.timeToStr(
    TimeOfDay.strToTime(stopTimes[previous][field]) +
      (i - previous) * (interval / (next - previous))
  );
}

class Agency {
  constructor(
    {
      agency,
      routes,
      trips,
      stops,
      stop_times,
      calendar,
      services,
      calendar_dates,
      frequencies
    },
    benchmarkDates = BENCHMARK_DATES
  ) {
    this.agency = agency || [];
    this.routes = routes || [];
    this.trips = trips || [];
    this.stops = stops || [];
    this.stop_times = stop_times || [];
    this.services = services || [];
    this.calendar = calendar || [];
    this.calendar_dates = calendar_dates || [];
    this.frequencies = frequencies || [];

    this.benchmarkDates = benchmarkDates;

    this.allBusTripSegments = null;

    this.indexData();
    this.classifyStopsByMode();
  }

  indexData() {
    // first, index routes by route_id.
    this.routesByRouteId = {};
    this.routes.forEach(
      route => (this.routesByRouteId[route.route_id] = route)
    );

    // next, make an index of stops by stop_id.
    // also calculate bounds of agency
    this.stopsByStopId = {};
    this.bounds = {
      minLat: 999,
      minLng: 999,
      maxLat: -999,
      maxLng: -999
    };
    this.stops.forEach(stop => {
      // calculate bounds of agency from stop positions
      if (stop.stop_lat < this.bounds.minLat) {
        this.bounds.minLat = stop.stop_lat;
      }
      if (stop.stop_lon < this.bounds.minLng) {
        this.bounds.minLng = stop.stop_lon;
      }
      if (stop.stop_lat > this.bounds.maxLat) {
        this.bounds.maxLat = stop.stop_lat;
      }
      if (stop.stop_lon > this.bounds.maxLng) {
        this.bounds.maxLng = stop.stop_lon;
      }
      // add stop to index
      this.stopsByStopId[stop.stop_id] = stop;
    });

    // next, index trips by trip_id.
    this.tripsByTripId = {};
    this.trips.forEach(trip => (this.tripsByTripId[trip.trip_id] = trip));

    // next, an index of stop_times by trip_id.
    // while we're at it, also calculate route types at each stop
    this.stopTimesByTripId = {};
    this.routeTypesByStopId = {};
    this.stop_times.forEach(stop_time => {
      this.stopTimesByTripId[stop_time.trip_id] =
        this.stopTimesByTripId[stop_time.trip_id] || [];
      this.stopTimesByTripId[stop_time.trip_id].push(stop_time);
      // used to classify stops by route type
      this.routeTypesByStopId[stop_time.stop_id] =
        this.routeTypesByStopId[stop_time.stop_id] || new Set();
      const trip = this.tripsByTripId[stop_time.trip_id];
      if (!trip) {
        // inavlid gtfs?  trip_id in stop_time, but not in trips?  Reading csv error?
        return;
      }
      const route = this.routesByRouteId[trip.route_id];
      let routeString;
      switch (route.route_type) {
        case 0:
        case 1:
        case 2:
        case 5:
        case 7:
          routeString = "rail";
          break;
        case 3:
          routeString = "bus";
          break;
        case 4:
          routeString = "ferry";
          break;
        default:
          break;
      }
      if (routeString) {
        this.routeTypesByStopId[stop_time.stop_id].add(routeString);
      }
    });

    // next, create additional stop_times for frequency-based gtfs trips
    this.frequencies.forEach(frequency => {
      const {
        end_time: endTime,
        headway_secs: headway,
        start_time: startTime,
        trip_id: tripId
      } = frequency
      const frequencyBeginTime = TimeOfDay.strToTime(startTime)
      const frequencyEndTime = TimeOfDay.strToTime(endTime)

      const referenceTrip = this.tripsByTripId[tripId]
      const tripStopTimes = this.stopTimesByTripId[tripId]
      tripStopTimes.sort(stopTimeSortComparator)

      // overwrite the existing tripStopTimes to
      // get the exact departure time according to frequencies
      this.stopTimesByTripId[tripId] = createFrequencyTripStopTimes(
        tripStopTimes,
        frequencyBeginTime,
        tripId
      )

      // create additional frequency trips and stop times
      let nextFrequencyTripStartTime = frequencyBeginTime + headway
      while (nextFrequencyTripStartTime < frequencyEndTime) {
        const newTripId = uuid.v4()

        // add new trip
        this.trips.push({
          ...referenceTrip,
          trip_id: newTripId
        })

        // add new array of stop_times
        this.stopTimesByTripId[newTripId] = createFrequencyTripStopTimes(
          tripStopTimes,
          nextFrequencyTripStartTime,
          newTripId
        )

        // Note that we don't use this.stop_times anywhere else, so we don't add to that array
        nextFrequencyTripStartTime += headway
      }
    })

    if (this.frequencies.length > 0) {
      console.log(`Processed ${this.frequencies.length} frequency based trips`)
    }

    Object.values(this.stopTimesByTripId).forEach(stopTimes => {
      stopTimes.sort(stopTimeSortComparator);
    });

    // next, index calendar by service_id.
    this.calendarByServiceId = {};
    this.calendar.forEach(
      calendar => (this.calendarByServiceId[calendar.service_id] = calendar)
    );
  }

  // returns all bus trip objects for a benchmark date type, which happens to check January
  // 6th-8th, 2018 right now, or whatever the benchmark day is in the hard coded
  // benchmark-date.json file.
  // dateType is one of {weekday, saturday, sunday}
  getAllBusTripsForBenchmarkDay (dateType) {
    const benchmarkDate = this.benchmarkDates[dateType].date
    const benchmarkDayOfWeek = this.benchmarkDates[dateType].dayOfWeek

    let numActiveTrips = 0;
    return this.trips
      .filter(trip => {
        // figure out if this goes on weekdays.
        const calendar = this.calendarByServiceId[trip.service_id];
        if (
          calendar &&
          calendar[benchmarkDayOfWeek] === 1 &&
          (benchmarkDate >= calendar.start_date &&
            benchmarkDate <= calendar.end_date) &&
          !this.calendar_dates.some(calendar_date => {
            // ensure there isn't an exception for the day.
            return (
              calendar_date.service_id === trip.service_id &&
              calendar_date.date === benchmarkDate &&
              calendar_date.exception_type == 2
            ); // exception is that the day is excluded.
          })
        ) {
          // use monday service as a proxy for general weekday service.
          numActiveTrips++;
          return true;
        }
        // some transit agencies put their usual service in the calendar_dates table with
        // no service listed in calendars at all.
        // look for a service on a non-holiday monday that's probably in the data set,
        // like January 8, 2018. This is the best we can do programmatically, I think.
        if (
          this.calendar_dates.some(calendar_date => {
            return (
              calendar_date.service_id === trip.service_id &&
              calendar_date.date === benchmarkDate &&
              calendar_date.exception_type == 1
            ); // the exception is that the day is included.
          })
        ) {
          numActiveTrips++;
          return true;
        }
      }) // only Monday service
      .filter(trip => this.routesByRouteId[trip.route_id].route_type === 3); // only buses

    this.noService = numActiveTrips === 0;

  }

  getAllBusTripSegments() {
    if (this.allBusTripSegments) {
      return this.allBusTripSegments;
    }

    // the keys to this map will be a string representation of the lat-long pairs
    // of the two stops involved. the values will represent a segment of travel and how
    // often it is traveled in each hour of the day for each route that
    // includes the segment.
    // SIMPLIFICATION: we probably should check for 15 minute frequency on *every*
    // weekday, but that would be hard, so let's just take Monday as a proxy.
    const segmentMap = {};

    // also, for debugging purposes, calculate route details.  This includes
    // max stop_times per route and per stop of route
    const debugLookup = {}

    for (const dateType of ['weekday', 'saturday', 'sunday']) {
      debugLookup[dateType] = {}
      const debugDateData = debugLookup[dateType]
      this.getAllBusTripsForBenchmarkDay(dateType)
        .forEach(({ trip_id, route_id, trip_headsign }) => {
          // look up the (sorted!) stop times for this trip.
          const stopTimes = this.stopTimesByTripId[trip_id];

          if (!stopTimes) {
            console.warn(`WARNING: No stop times for trip ${trip_id}`);
            return;
          }
          // now, for each pair of stops, add it to the segmentMap.
          for (let i = 1; i < stopTimes.length; i++) {
            const from = stopTimes[i - 1];
            const to = stopTimes[i];

            const fromStop = this.stopsByStopId[from.stop_id];
            const toStop = this.stopsByStopId[to.stop_id];

            const key = `${fromStop.stop_lat},${fromStop.stop_lon},${
              toStop.stop_lat
            },${toStop.stop_lon}`;

            segmentMap[key] = segmentMap[key] || {
              from: {
                lat: fromStop.stop_lat,
                lng: fromStop.stop_lon,
                name: fromStop.stop_name
              },
              to: {
                lat: toStop.stop_lat,
                lng: toStop.stop_lon,
                name: toStop.stop_name
              },
              weekday: {},
              saturday: {},
              sunday: {}
            };
            const route = this.routesByRouteId[route_id];
            segmentMap[key][dateType][route_id] = segmentMap[key][dateType][
              route_id
            ] || {
              name: route.route_short_name,
              headsign: trip_headsign,
              stopCountByHour: (new Array(24)).fill(0),
            };

            // we can't just index into stopTimes because a lot of stopTime
            // times are blank and figured out via interpolation.
            const fromDepartureTime = getDepartureTimeForStopTime(
              stopTimes,
              i - 1
            );
            const toDepartureTime = getDepartureTimeForStopTime(
              stopTimes,
              i
            );

            // increment the appropriate hour bucket.
            segmentMap[key][dateType][route_id].stopCountByHour[TimeOfDay.hour(fromDepartureTime)]++;

            // also increment debugging details
            // TODO: also include rail segments
            debugDateData[route_id] = debugDateData[route_id] || {
              directions: {},
              maxStopCountByHour: (new Array(24)).fill(0),
              name: route.route_short_name
                ? (
                  route.route_long_name
                    ? `${route.route_short_name} - ${route.route_long_name}`
                    : route.route_short_name
                  )
                : route.route_long_name
            }
            const routeData = debugDateData[route_id]
            const trip = this.tripsByTripId[trip_id]
            const directionId = trip ? (trip.direction_id || 'blank') : 'blank'
            routeData.directions[directionId] = routeData.directions[directionId] || {
              maxStopCountByHour: (new Array(24)).fill(0),
              stops: {}
            }
            const directionData = routeData.directions[directionId]
            const stops = [{
              stop_id: toStop.stop_id,
              time: toDepartureTime
            }]
            if (i === 1) {
              stops.push({
                stop_id: fromStop.stop_id,
                time: fromDepartureTime
              })
            }
            stops.forEach(stop => {
              directionData.stops[stop.stop_id] = directionData.stops[stop.stop_id] || {
                stopCountByHour: (new Array(24)).fill(0)
              }
              const hour = TimeOfDay.hour(stop.time)
              directionData.stops[stop.stop_id].stopCountByHour[hour]++
              const stopCount = directionData.stops[stop.stop_id].stopCountByHour[hour]
              if (directionData.maxStopCountByHour[hour] < stopCount) {
                directionData.maxStopCountByHour[hour] = stopCount
              }
              if (routeData.maxStopCountByHour[hour] < stopCount) {
                routeData.maxStopCountByHour[hour] = stopCount
              }
            })
          }
        });
    }

    this.debugDetails = debugLookup
    this.allBusTripSegments = Object.values(segmentMap);
    return this.allBusTripSegments;
  }

  // numberOfHours is the number of hours between start and end hours that need
  // to meet the busesPerHour metric. By default, it's over the entire set of hours.
  // note that the numberOfHours peak hours are chosen, and they do not need to
  // be contiguous.
  isXBusesPerHourBetweenHours(segment, dateType, busesPerHour, startHourInclusive, endHourExclusive, numberOfHours = (endHourExclusive - startHourInclusive)) {
    const HOURS_PER_DAY = 24;
    if (!(dateType === 'weekday' || dateType === 'saturday' || dateType === 'sunday')) {
      throw new Error(`dateType ${dateType} should be one of: weekday, saturday, sunday.`);
    }

    // sum up every hour bucket across all the routes for the segment.
    const totalStopCountByHourAcrossRoutes = Object.values(segment[dateType]).reduce(
      (prev, { stopCountByHour }) => {
        for (let i = 0; i < HOURS_PER_DAY; i++) {
          prev[i] += stopCountByHour[i];
        }
        return prev;
      },
      (new Array(HOURS_PER_DAY).fill(0))
    );

    // now look at all the hours where we need to have X buses. after talking
    // with Annie, what we want here is X buses per hour for each clock hour in
    // the set.
    let hoursThatQualify = 0;
    for (let hour = startHourInclusive; hour < endHourExclusive; hour++) {
      if (totalStopCountByHourAcrossRoutes[hour] >= busesPerHour) {
        hoursThatQualify++;
      }
    }
    return hoursThatQualify >= numberOfHours;
  }

  getHighFrequencyStops() {
    return dedupePointList([
      ...this.getHighFrequencyStopsUnderCurrentSB827Text(),
      ...this.getAlternateHighFrequencyStops(6, 7, 18, STOP_TYPE_HIGH_FREQUENCY_BUS_6X_7AM_6PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(6, 7, 20, STOP_TYPE_HIGH_FREQUENCY_BUS_6X_7AM_8PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(6, 7, 22, STOP_TYPE_HIGH_FREQUENCY_BUS_6X_7AM_10PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(5, 7, 18, STOP_TYPE_HIGH_FREQUENCY_BUS_5X_7AM_6PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(5, 7, 20, STOP_TYPE_HIGH_FREQUENCY_BUS_5X_7AM_8PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(5, 7, 22, STOP_TYPE_HIGH_FREQUENCY_BUS_5X_7AM_10PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(4, 7, 18, STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_6PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(4, 7, 20, STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_8PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(4, 7, 22, STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_10PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(3, 7, 18, STOP_TYPE_HIGH_FREQUENCY_BUS_3X_7AM_6PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(3, 7, 20, STOP_TYPE_HIGH_FREQUENCY_BUS_3X_7AM_8PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(3, 7, 22, STOP_TYPE_HIGH_FREQUENCY_BUS_3X_7AM_10PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(6, 6, 18, STOP_TYPE_HIGH_FREQUENCY_BUS_6X_6AM_6PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(6, 6, 20, STOP_TYPE_HIGH_FREQUENCY_BUS_6X_6AM_8PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(6, 6, 22, STOP_TYPE_HIGH_FREQUENCY_BUS_6X_6AM_10PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(5, 6, 18, STOP_TYPE_HIGH_FREQUENCY_BUS_5X_6AM_6PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(5, 6, 20, STOP_TYPE_HIGH_FREQUENCY_BUS_5X_6AM_8PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(5, 6, 22, STOP_TYPE_HIGH_FREQUENCY_BUS_5X_6AM_10PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(4, 6, 18, STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_6PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(4, 6, 20, STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_8PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(4, 6, 22, STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_10PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(3, 6, 18, STOP_TYPE_HIGH_FREQUENCY_BUS_3X_6AM_6PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(3, 6, 20, STOP_TYPE_HIGH_FREQUENCY_BUS_3X_6AM_8PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(3, 6, 22, STOP_TYPE_HIGH_FREQUENCY_BUS_3X_6AM_10PM, 'weekday'),

      // types needed for amendments 2018-04-09.
      // My understanding of the amendments is that to qualify a segment requires any one of the following four time frames,
      // plus the weekend time frames, plus 3X_6AM_10PM
      ...this.getAlternateHighFrequencyStops(4, 6, 9, STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_9AM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(4, 7, 10, STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_10AM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(4, 15, 18, STOP_TYPE_HIGH_FREQUENCY_BUS_4X_3PM_6PM, 'weekday'),
      ...this.getAlternateHighFrequencyStops(4, 16, 19, STOP_TYPE_HIGH_FREQUENCY_BUS_4X_4PM_7PM, 'weekday'),

      ...this.getAlternateHighFrequencyStops(2, 8, 22, STOP_TYPE_HIGH_FREQUENCY_BUS_SATURDAY_2X_8AM_10PM, 'saturday'),
      ...this.getAlternateHighFrequencyStops(2, 8, 22, STOP_TYPE_HIGH_FREQUENCY_BUS_SUNDAY_2X_8AM_10PM, 'sunday')
    ]);
  }

  // takes in a segment and converts both stops on the segment to stop with
  // type stopType.
  segmentToStops({
    from: { lat: fromLat, lng: fromLng },
    to: { lat: toLat, lng: toLng }
  }, stopType) {
    return [
      {
        lat: fromLat,
        lng: fromLng,
        types: [stopType]
      },
      {
        lat: toLat,
        lng: toLng,
        types: [stopType]
      }
    ];
  }

  getAlternateHighFrequencyStops(busesPerHour, startHourInclusive, endHourExclusive, stopType, dateType) {
    const allBusTripSegments = this.getAllBusTripSegments();

    return allBusTripSegments
      .filter(segment => this.isXBusesPerHourBetweenHours(segment, dateType, busesPerHour, startHourInclusive, endHourExclusive))
      .map(segment => this.segmentToStops(segment, stopType))
      .reduce((prev, current) => [...prev, ...current], []);
  }

  getHighFrequencyStopsUnderCurrentSB827Text() {
    return this.getHighFrequencySegmentsUnderCurrentSB827Text()
      .map(segment => this.segmentToStops(segment, STOP_TYPE_HIGH_FREQUENCY_BUS))
      .reduce((prev, current) => [...prev, ...current], []);
  }

  // according to the April 10, 2018 version of SB827, a bus is high frequency
  // if all of the following:
  // (1) It has average service intervals of no more than 15 minutes during the
  // three peak hours between 6 a.m. to 10 a.m., inclusive, and the three peak
  // hours between 3 p.m. and 7 p.m., inclusive, on Monday through Friday.
  // (2) It has average service intervals of no more than 20 minutes during the
  // hours of 6 a.m. to 10 a.m. (sic, should be 10pm), inclusive, on Monday
  // through Friday.
  // (3) It has average intervals of no more than 30 minutes during the hours of
  // 8 a.m. to 10 p.m., inclusive, on Saturday and Sunday.
  getHighFrequencySegmentsUnderCurrentSB827Text() {
    // test weekday bus segments for:
    // 3 peak hours of 15 minute average intervals in the morning.
    // 3 peak hours of 15 minute average intervals in the afternoon.
    // 20 minute average intervals from 6am to 10pm
    return this.getAllBusTripSegments()
      .filter(segment => this.isXBusesPerHourBetweenHours(segment, 'weekday', 4, 6, 10, 3))
      .filter(segment => this.isXBusesPerHourBetweenHours(segment, 'weekday', 4, 15, 19, 3))
      .filter(segment => this.isXBusesPerHourBetweenHours(segment, 'weekday', 3, 6, 22))
      .filter(segment => this.isXBusesPerHourBetweenHours(segment, 'saturday', 2, 8, 22))
      .filter(segment => this.isXBusesPerHourBetweenHours(segment, 'sunday', 2, 8, 22));
  }

  getRailMajorTransitStops() {
    return this.railStops;
  }

  classifyStopsByMode() {
    this.railStops = [];
    this.busStops = [];
    this.ferryStops = [];
    this.stops.forEach(stop => {
      // get all routeIds that serve this stop
      const routeTypes = this.routeTypesByStopId[stop.stop_id];
      if (!routeTypes || routeTypes.length === 0) {
        // not served by any trip!
        return;
      }

      const stopPosition = { lat: stop.stop_lat, lng: stop.stop_lon };

      routeTypes.forEach(routeType => {
        this[`${routeType}Stops`].push(stopPosition);
      });
    });
  }

  static async fromDirectory(directory) {
    const requiredFiles = [
      "agency",
      "calendar",
      "routes",
      "stop_times",
      "stops",
      "trips"
    ];
    const parsedRequiredFiles = await Promise.all(
      requiredFiles.map(base => `${directory}/${base}.txt`).map(parseFile)
    );

    const optionalFiles = ["calendar_dates", "frequencies"];
    const parsedOptionalFiles = await Promise.all(
      optionalFiles
        .map(base => `${directory}/${base}.txt`)
        .map(file => parseFile(file, true))
    );

    // read benchmark-date.txt if it exists.
    let benchmarkDates = BENCHMARK_DATES;
    try {
      benchmarkDates = JSON.parse(
        fs.readFileSync(`${directory}/benchmark-date.json`)
      );
    } catch (e) {
      // if the file didn't exist, that's fine.
      if (e.code !== "ENOENT") {
        throw e;
      }
    }

    const result = {};
    requiredFiles.forEach(
      (name, index) => (result[name] = parsedRequiredFiles[index])
    );
    optionalFiles.forEach(
      (name, index) => (result[name] = parsedOptionalFiles[index])
    );
    return new Agency(result, benchmarkDates);
  }
}

// very simple parsing of CSV file; returns a promise of an array of objects,
// one per line of the CSV, with fields taken from the names in the first line.
function parseFile(file, optional = false) {
  return new Promise((resolve, reject) => {
    const result = [];
    fs
      .createReadStream(file)
      .on("error", error => {
        if (error.code === "ENOENT" && optional) {
          // we didn't need this file; return an empty array.
          resolve([]);
        }
        reject(error);
      })
      .pipe(
        parse({
          auto_parse: true,
          columns: true,
          trim: true
        })
      )
      .on("data", data => result.push(data))
      .on("error", error => reject(error))
      .on("finish", () => resolve(result));
  });
}

function stopTimeSortComparator (stopTime1, stopTime2) {
  return stopTime1.stop_sequence - stopTime2.stop_sequence
}

function createFrequencyTripStopTimes (referenceStopTimes, firstStopBeginTime, tripId) {
  const offset = firstStopBeginTime - TimeOfDay.strToTime(referenceStopTimes[0].arrival_time)
  return referenceStopTimes.map(stopTime => {
    return {
      ...stopTime,
      trip_id: tripId,
      arrival_time: offsetTime(stopTime.arrival_time, offset),
      departure_time: offsetTime(stopTime.departure_time, offset)
    }
  })
}

function offsetTime (oldTimeStr, offset) {
  if (!oldTimeStr) return
  return TimeOfDay.timeToStr(
    TimeOfDay.strToTime(oldTimeStr) + offset
  )
}

module.exports = Agency;
