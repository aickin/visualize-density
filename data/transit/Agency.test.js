const Agency = require("./Agency");

function makeRoute(
  route_id,
  route_type,
  route_short_name = route_id,
  route_long_name = `Route ${route_id}`,
  agency_id = "agency"
) {
  return { route_id, agency_id, route_short_name, route_long_name, route_type };
}

function makeTrip(trip_id, route_id, service_id, direction_id = 0) {
  return { trip_id, route_id, service_id, direction_id };
}

function makeStop(stop_id, stop_lat, stop_lon, stop_name = `Stop ${stop_id}`) {
  return { stop_id, stop_lat, stop_lon, stop_name };
}

function makeStopTime(
  trip_id,
  stop_id,
  stop_sequence = 1,
  arrival_time = "7:30:00",
  departure_time = arrival_time
) {
  return { trip_id, stop_id, stop_sequence, arrival_time, departure_time };
}

test("finds rail stations", () => {
  const agency = new Agency({
    routes: [
      makeRoute("0", 0), // light rail
      makeRoute("1", 1), // subway
      makeRoute("2", 2), // rail
      makeRoute("3", 3), // bus
      makeRoute("4", 4), // ferry
      makeRoute("5", 5), // cable car
      makeRoute("6", 6), // gondola
      makeRoute("7", 7) // funicular
    ],
    trips: [
      makeTrip("0", "0", "weekday"),
      makeTrip("1", "1", "weekday"),
      makeTrip("2", "2", "weekday"),
      makeTrip("3", "3", "weekday"),
      makeTrip("4", "4", "weekday"),
      makeTrip("5", "5", "weekday"),
      makeTrip("6", "6", "weekday"),
      makeTrip("7", "7", "weekday")
    ],
    stops: [
      makeStop("0", 0.0, 0.0),
      makeStop("1", 1.0, 1.0),
      makeStop("2", 2.0, 2.0),
      makeStop("3", 3.0, 3.0),
      makeStop("4", 4.0, 4.0),
      makeStop("5", 5.0, 5.0),
      makeStop("6", 6.0, 6.0),
      makeStop("7", 7.0, 7.0)
    ],
    stop_times: [
      makeStopTime("0", "0"),
      makeStopTime("1", "1"),
      makeStopTime("2", "2"),
      makeStopTime("3", "3"),
      makeStopTime("4", "4"),
      makeStopTime("5", "5"),
      makeStopTime("6", "6"),
      makeStopTime("7", "7")
    ]
  });
  const majorTransitStops = agency.getRailMajorTransitStops();

  expect(majorTransitStops.length).toBe(3);
  expect(majorTransitStops[0].lat).toBe(0.0);
  expect(majorTransitStops[1].lng).toBe(1.0);
  expect(majorTransitStops[2].lng).toBe(2.0);
});

test("finds bus stops on segments that have 2 routes with <15 minute frequency", () => {
  const agency = new Agency({
    routes: [
      makeRoute("1", 3), // bus
      makeRoute("2", 3) // bus
    ],
    trips: [
      makeTrip("1.0", "1", "weekday"),
      makeTrip("1.1", "1", "weekday"),
      makeTrip("1.2", "1", "weekday"),
      makeTrip("1.3", "1", "weekday"),
      makeTrip("1.4", "1", "weekday"),
      makeTrip("1.5", "1", "weekday"),
      makeTrip("1.6", "1", "weekday"),
      makeTrip("1.7", "1", "weekday"),
      makeTrip("1.8", "1", "weekday"),
      makeTrip("1.10", "1", "weekday"),
      makeTrip("1.11", "1", "weekday"),
      makeTrip("1.12", "1", "weekday"),
      makeTrip("1.13", "1", "weekday"),
      makeTrip("1.14", "1", "weekday"),
      makeTrip("1.15", "1", "weekday"),
      makeTrip("1.16", "1", "weekday"),
      makeTrip("1.17", "1", "weekday"),
      makeTrip("1.18", "1", "weekday"),
      makeTrip("2.0", "2", "weekday"),
      makeTrip("2.1", "2", "weekday"),
      makeTrip("2.2", "2", "weekday"),
      makeTrip("2.3", "2", "weekday"),
      makeTrip("2.4", "2", "weekday"),
      makeTrip("2.5", "2", "weekday"),
      makeTrip("2.6", "2", "weekday"),
      makeTrip("2.7", "2", "weekday"),
      makeTrip("2.8", "2", "weekday"),
      makeTrip("2.10", "2", "weekday"),
      makeTrip("2.11", "2", "weekday"),
      makeTrip("2.12", "2", "weekday"),
      makeTrip("2.13", "2", "weekday"),
      makeTrip("2.14", "2", "weekday"),
      makeTrip("2.15", "2", "weekday"),
      makeTrip("2.16", "2", "weekday"),
      makeTrip("2.17", "2", "weekday"),
      makeTrip("2.18", "2", "weekday")
    ],
    stops: [
      makeStop("0", 0.0, 0.0),
      makeStop("1", 0.0, 1.0),
      makeStop("2", 0.0, 2.0),
      makeStop("3", 1.0, 1.0)
    ],
    stop_times: [
      makeStopTime("1.0", "0", 0),
      makeStopTime("1.1", "0", 0),
      makeStopTime("1.2", "0", 0),
      makeStopTime("1.3", "0", 0),
      makeStopTime("1.4", "0", 0),
      makeStopTime("1.5", "0", 0),
      makeStopTime("1.6", "0", 0),
      makeStopTime("1.7", "0", 0),
      makeStopTime("1.8", "0", 0),
      makeStopTime("1.0", "1", 1),
      makeStopTime("1.1", "1", 1),
      makeStopTime("1.2", "1", 1),
      makeStopTime("1.3", "1", 1),
      makeStopTime("1.4", "1", 1),
      makeStopTime("1.5", "1", 1),
      makeStopTime("1.6", "1", 1),
      makeStopTime("1.7", "1", 1),
      makeStopTime("1.8", "1", 1),
      makeStopTime("1.0", "3", 2),
      makeStopTime("1.1", "3", 2),
      makeStopTime("1.2", "3", 2),
      makeStopTime("1.3", "3", 2),
      makeStopTime("1.4", "3", 2),
      makeStopTime("1.5", "3", 2),
      makeStopTime("1.6", "3", 2),
      makeStopTime("1.7", "3", 2),
      makeStopTime("1.8", "3", 2),
      makeStopTime("1.10", "0", 0, "17:00:00"),
      makeStopTime("1.11", "0", 0, "17:00:00"),
      makeStopTime("1.12", "0", 0, "17:00:00"),
      makeStopTime("1.13", "0", 0, "17:00:00"),
      makeStopTime("1.14", "0", 0, "17:00:00"),
      makeStopTime("1.15", "0", 0, "17:00:00"),
      makeStopTime("1.16", "0", 0, "17:00:00"),
      makeStopTime("1.17", "0", 0, "17:00:00"),
      makeStopTime("1.18", "0", 0, "17:00:00"),
      makeStopTime("1.10", "1", 1, "17:00:00"),
      makeStopTime("1.11", "1", 1, "17:00:00"),
      makeStopTime("1.12", "1", 1, "17:00:00"),
      makeStopTime("1.13", "1", 1, "17:00:00"),
      makeStopTime("1.14", "1", 1, "17:00:00"),
      makeStopTime("1.15", "1", 1, "17:00:00"),
      makeStopTime("1.16", "1", 1, "17:00:00"),
      makeStopTime("1.17", "1", 1, "17:00:00"),
      makeStopTime("1.18", "1", 1, "17:00:00"),
      makeStopTime("1.10", "3", 2, "17:00:00"),
      makeStopTime("1.11", "3", 2, "17:00:00"),
      makeStopTime("1.12", "3", 2, "17:00:00"),
      makeStopTime("1.13", "3", 2, "17:00:00"),
      makeStopTime("1.14", "3", 2, "17:00:00"),
      makeStopTime("1.15", "3", 2, "17:00:00"),
      makeStopTime("1.16", "3", 2, "17:00:00"),
      makeStopTime("1.17", "3", 2, "17:00:00"),
      makeStopTime("1.18", "3", 2, "17:00:00"),
      makeStopTime("2.0", "2", 0),
      makeStopTime("2.1", "2", 0),
      makeStopTime("2.2", "2", 0),
      makeStopTime("2.3", "2", 0),
      makeStopTime("2.4", "2", 0),
      makeStopTime("2.5", "2", 0),
      makeStopTime("2.6", "2", 0),
      makeStopTime("2.7", "2", 0),
      makeStopTime("2.8", "2", 0),
      makeStopTime("2.0", "1", 1),
      makeStopTime("2.1", "1", 1),
      makeStopTime("2.2", "1", 1),
      makeStopTime("2.3", "1", 1),
      makeStopTime("2.4", "1", 1),
      makeStopTime("2.5", "1", 1),
      makeStopTime("2.6", "1", 1),
      makeStopTime("2.7", "1", 1),
      makeStopTime("2.8", "1", 1),
      makeStopTime("2.0", "3", 2),
      makeStopTime("2.1", "3", 2),
      makeStopTime("2.2", "3", 2),
      makeStopTime("2.3", "3", 2),
      makeStopTime("2.4", "3", 2),
      makeStopTime("2.5", "3", 2),
      makeStopTime("2.6", "3", 2),
      makeStopTime("2.7", "3", 2),
      makeStopTime("2.8", "3", 2),
      makeStopTime("2.10", "2", 0, "17:00:00"),
      makeStopTime("2.11", "2", 0, "17:00:00"),
      makeStopTime("2.12", "2", 0, "17:00:00"),
      makeStopTime("2.13", "2", 0, "17:00:00"),
      makeStopTime("2.14", "2", 0, "17:00:00"),
      makeStopTime("2.15", "2", 0, "17:00:00"),
      makeStopTime("2.16", "2", 0, "17:00:00"),
      makeStopTime("2.17", "2", 0, "17:00:00"),
      makeStopTime("2.18", "2", 0, "17:00:00"),
      makeStopTime("2.10", "1", 1, "17:00:00"),
      makeStopTime("2.11", "1", 1, "17:00:00"),
      makeStopTime("2.12", "1", 1, "17:00:00"),
      makeStopTime("2.13", "1", 1, "17:00:00"),
      makeStopTime("2.14", "1", 1, "17:00:00"),
      makeStopTime("2.15", "1", 1, "17:00:00"),
      makeStopTime("2.16", "1", 1, "17:00:00"),
      makeStopTime("2.17", "1", 1, "17:00:00"),
      makeStopTime("2.18", "1", 1, "17:00:00"),
      makeStopTime("2.10", "3", 2, "17:00:00"),
      makeStopTime("2.11", "3", 2, "17:00:00"),
      makeStopTime("2.12", "3", 2, "17:00:00"),
      makeStopTime("2.13", "3", 2, "17:00:00"),
      makeStopTime("2.14", "3", 2, "17:00:00"),
      makeStopTime("2.15", "3", 2, "17:00:00"),
      makeStopTime("2.16", "3", 2, "17:00:00"),
      makeStopTime("2.17", "3", 2, "17:00:00"),
      makeStopTime("2.18", "3", 2, "17:00:00")
    ]
  });

  const majorTransitStops = agency.getRailMajorTransitStops();

  expect(majorTransitStops.length).toBe(2);
  expect(majorTransitStops[0].lat).toBe(0.0);
  expect(majorTransitStops[0].lng).toBe(1.0);
  expect(majorTransitStops[1].lat).toBe(1.0);
  expect(majorTransitStops[1].lng).toBe(1.0);

  const highFrequencyCorridors = agency.getHighFrequencyCorridors();

  expect(highFrequencyCorridors.length).toBe(3);
  expect(highFrequencyCorridors[0][0].lat).toBe(0.0);
  expect(highFrequencyCorridors[0][0].lng).toBe(0.0);
  expect(highFrequencyCorridors[0][1].lat).toBe(0.0);
  expect(highFrequencyCorridors[0][1].lng).toBe(1.0);
});
