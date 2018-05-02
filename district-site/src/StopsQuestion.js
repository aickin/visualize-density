import React from "react";
import { Icon, Statistic } from "semantic-ui-react";
import Question from "./Question";
import stops from "@aickin/visualize-density-data/output/stops";
import { stopTypes } from "@aickin/visualize-density-common";
import {
  SENATE_DISTRICT_COUNT,
  ASSEMBLY_DISTRICT_COUNT
} from "./LegislatureDistrictCounts";

const {
  STOP_TYPE_HIGH_FREQUENCY_BUS,
  STOP_TYPE_MTS_FERRY,
  STOP_TYPE_MTS_RAIL,
  isHighFrequencyStopUnderCurrentSB827Text
} = stopTypes;

export function DistrictStopsQuestion({ id, house, district }) {
  if (house !== "Senate" && house !== "Assembly") {
    throw new Error(
      `The house prop must be "Senate" or "Assembly"; it was "${house}".`
    );
  }
  // const stopCounts = getStopCountsForDistrict(
  //   stops,
  //   district,
  //   house.toLowerCase()
  // );

  const districtRanks = getDistrictRanks(
    stops,
    district.id,
    house.toLowerCase()
  );

  return (
    <div style={{ pageBreakInside: "avoid" }}>
      <Question>
        How many SB 827-eligible transit stops are in {house} District {id}?
      </Question>
      <div
        style={{ textAlign: "left", paddingTop: "1.5em", paddingLeft: "25px" }}
      >
        <div style={{ fontSize: "1.2em", lineHeight: 1.42 }}>
          Ranked against all{" "}
          {house === "Senate" ? SENATE_DISTRICT_COUNT : ASSEMBLY_DISTRICT_COUNT}{" "}
          {house} districts, District {id} is:
        </div>
      </div>
      <StopRankStatistics districtRanks={districtRanks} />
      <div style={{ paddingTop: "2em" }}>
        (Note these counts do not represent all transit in {house.charAt(0)}D{" "}
        {id}, just stops that are SB 827-eligible.)
      </div>
    </div>
  );
}

export function StateStopsQuestion() {
  return (
    <div style={{ pageBreakInside: "avoid" }}>
      <Question>
        How many SB 827-eligible transit stops are in California?
      </Question>
      <StopStatistics stopCounts={getStopCounts(stops)} />
      <div style={{ paddingTop: "2em" }}>
        (Note these counts do not represent all transit in California, just
        stops that are SB 827-eligible.)
      </div>
    </div>
  );
}

const StopRankStatistics = ({ districtRanks }) => (
  <Statistic.Group widths="3" style={{ paddingTop: "1.5em" }}>
    <StopStatistic
      label={`In Bus Stops ${
        districtRanks.bus.tie > 1
          ? "(" + districtRanks.bus.tie + "-Way Tie)"
          : ""
      }`}
      icons={["bus"]}
      count={"#" + districtRanks.bus.rank}
    />
    <StopStatistic
      label={`In Rail Stops ${
        districtRanks.rail.tie > 1
          ? "(" + districtRanks.rail.tie + "-Way Tie)"
          : ""
      }`}
      icons={["train"]}
      count={"#" + districtRanks.rail.rank}
    />
    <StopStatistic
      label={`In Total Stops ${
        districtRanks.total.tie > 1
          ? "(" + districtRanks.total.tie + "-Way Tie)"
          : ""
      }`}
      count={"#" + districtRanks.total.rank}
    />
  </Statistic.Group>
);

const StopStatistics = ({ stopCounts }) => (
  <Statistic.Group widths="3" style={{ paddingTop: "1.5em" }}>
    <StopStatistic label="Bus Stops" icons={["bus"]} count={stopCounts.bus} />
    <StopStatistic
      label="Rail Stops"
      icons={["train"]}
      count={stopCounts.mtsRail}
    />
    <StopStatistic
      label="Ferry Stops"
      icons={["ship"]}
      count={stopCounts.mtsFerry}
    />
  </Statistic.Group>
);

const StopStatistic = ({ count, icons, label }) => (
  <Statistic>
    <Statistic.Value>
      {icons &&
        icons.map((name, i) => <Icon name={name} key={i} color="blue" />)}
      {count}
    </Statistic.Value>
    <Statistic.Label>{label}</Statistic.Label>
  </Statistic>
);

function getStopCounts(stops) {
  // note that because some stops have multiple types, total may less than the
  // sum of the parts.
  const result = {
    bus: 0,
    mtsFerry: 0,
    mtsRail: 0,
    total: 0
  };

  stops.forEach(({ types }) => {
    if (isHighFrequencyStopUnderCurrentSB827Text({ types })) {
      result.bus++;
    }
    if (types.includes(STOP_TYPE_MTS_FERRY)) {
      result.mtsFerry++;
    }
    if (types.includes(STOP_TYPE_MTS_RAIL)) {
      result.mtsRail++;
    }
    if (
      isHighFrequencyStopUnderCurrentSB827Text({ types }) ||
      types.includes(STOP_TYPE_MTS_FERRY) ||
      types.includes(STOP_TYPE_MTS_RAIL)
    ) {
      result.total++;
    }
  });
  return result;
}

// this was copied and modified from private-site LegislatureTable.js. TODO: think about pulling
// it out into a common project.
function getStopCountsForDistrict(allStops, district, stopField) {
  return getStopCounts(
    allStops.filter(({ [stopField]: districtId }) => {
      return districtId && districtId === district.id;
    })
  );
}

function getDistrictRanks(allStops, districtId, house) {
  const allTotals = new Array(
    house === "senate" ? SENATE_DISTRICT_COUNT : ASSEMBLY_DISTRICT_COUNT
  )
    .fill(undefined)
    .map(_ => ({
      bus: 0,
      rail: 0,
      total: 0
    }));

  allStops.forEach(stop => {
    const id = stop[house] - 1;

    if (isHighFrequencyStopUnderCurrentSB827Text(stop)) {
      allTotals[id].bus++;
    }
    if (stop.types.includes(STOP_TYPE_MTS_RAIL)) {
      allTotals[id].rail++;
    }
    if (
      isHighFrequencyStopUnderCurrentSB827Text(stop) ||
      stop.types.includes(STOP_TYPE_MTS_FERRY) ||
      stop.types.includes(STOP_TYPE_MTS_RAIL)
    ) {
      allTotals[id].total++;
    }
  });

  const districtTotals = allTotals[districtId - 1];

  // now find the rank for each.
  return {
    bus: {
      rank: allTotals.reduce(
        (total, current) =>
          current.bus > districtTotals.bus ? total + 1 : total,
        1
      ),
      tie: allTotals.reduce(
        (total, current) =>
          current.bus === districtTotals.bus ? total + 1 : total,
        0
      )
    },
    rail: {
      rank: allTotals.reduce(
        (total, current) =>
          current.rail > districtTotals.rail ? total + 1 : total,
        1
      ),
      tie: allTotals.reduce(
        (total, current) =>
          current.rail === districtTotals.rail ? total + 1 : total,
        0
      )
    },
    total: {
      rank: allTotals.reduce(
        (total, current) =>
          current.total > districtTotals.total ? total + 1 : total,
        1
      ),
      tie: allTotals.reduce(
        (total, current) =>
          current.total === districtTotals.total ? total + 1 : total,
        0
      )
    }
  };
}
