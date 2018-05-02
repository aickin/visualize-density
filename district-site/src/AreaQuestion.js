import React from "react";
import { Table } from "semantic-ui-react";
import Question from "./Question";

import senateDistrictSB827Area from "@aickin/visualize-density-data/output/senate-districts-sb827-area.json";
import assemblyDistrictSB827Area from "@aickin/visualize-density-data/output/assembly-districts-sb827-area.json";

const AreaTable = ({ area, name }) => (
  <Table collapsing unstackable fluid>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell />
        <Table.HeaderCell>Area (sq. mi.)</Table.HeaderCell>
        <Table.HeaderCell>
          % of {name}
          <br />Total Area
        </Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      <Table.Row>
        <Table.Cell singleLine={false}>
          SB 827 allows buildings up to 45&apos;
        </Table.Cell>
        <Table.Cell>{area.lowArea.toFixed(1)}</Table.Cell>
        <Table.Cell>
          {(area.lowArea * 100 / area.totalArea).toFixed(1)}%
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell singleLine={false}>
          SB 827 allows buildings up to 55&apos;
        </Table.Cell>
        <Table.Cell>{area.highArea.toFixed(1)}</Table.Cell>
        <Table.Cell>
          {(area.highArea * 100 / area.totalArea).toFixed(1)}%
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell singleLine={false}>
          SB 827 has parking and density controls only
        </Table.Cell>
        <Table.Cell>{area.noArea.toFixed(1)}</Table.Cell>
        <Table.Cell>
          {(area.noArea * 100 / area.totalArea).toFixed(1)}%
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell singleLine={false}>Unaffected by SB 827</Table.Cell>
        <Table.Cell>
          {(
            area.totalArea -
            area.highArea -
            area.lowArea -
            area.noArea
          ).toFixed(1)}
        </Table.Cell>
        <Table.Cell>
          {(
            (area.totalArea - area.highArea - area.lowArea - area.noArea) *
            100 /
            area.totalArea
          ).toFixed(1)}%
        </Table.Cell>
      </Table.Row>
    </Table.Body>
    <Table.Footer>
      <Table.Row>
        <Table.HeaderCell>Total</Table.HeaderCell>
        <Table.HeaderCell>{area.totalArea.toFixed(1)}</Table.HeaderCell>
        <Table.HeaderCell>100%</Table.HeaderCell>
      </Table.Row>
    </Table.Footer>
  </Table>
);

export function DistrictAreaQuestion({ id, house, district }) {
  if (house !== "Senate" && house !== "Assembly") {
    throw new Error(
      `The house prop must be "Senate" or "Assembly"; it was "${house}".`
    );
  }

  const areas =
    house === "Senate" ? senateDistrictSB827Area : assemblyDistrictSB827Area;

  const area = areas[id];

  if (!area) {
    throw new Error(
      `There was no calculated area for ${house} district ${id}.`
    );
  }
  return (
    <div style={{ pageBreakInside: "avoid" }}>
      <Question>
        How much of {house} District {id}&apos;s area will be affected?
      </Question>
      <div
        style={{
          paddingTop: "1.5em",
          maxWidth: "500px",
          marginLeft: "auto",
          marginRight: "auto"
        }}
      >
        <AreaTable area={area} name={`${house.charAt(0)}D ${id}`} />
      </div>
    </div>
  );
}

export function StateAreaQuestion() {
  const area = Object.values(senateDistrictSB827Area).reduce(
    (prev, current) => {
      return {
        noArea: prev.noArea + current.noArea,
        lowArea: prev.lowArea + current.lowArea,
        highArea: prev.highArea + current.highArea,
        totalArea: prev.totalArea + current.totalArea
      };
    },
    { noArea: 0, lowArea: 0, highArea: 0, totalArea: 0 }
  );

  return (
    <div style={{ pageBreakInside: "avoid" }}>
      <Question>How much of California&apos;s area will be affected?</Question>
      <div
        style={{
          paddingTop: "1.5em",
          maxWidth: "500px",
          marginLeft: "auto",
          marginRight: "auto"
        }}
      >
        <AreaTable area={area} name="California" />
      </div>
    </div>
  );
}
