import React from "react";
import { Table } from "semantic-ui-react";

import { stopTypes } from "@aickin/visualize-density-common";

const { STOP_TYPE_MTS_FERRY, STOP_TYPE_MTS_RAIL } = stopTypes;

export default class LegislatureTable extends React.Component {
  constructor() {
    super();

    this.state = {
      column: "id",
      direction: "ascending"
    };

    this.handleSortId = this.handleSort.bind(this, "id");
    this.handleSortMember = this.handleSort.bind(this, "memberLastName");
    this.handleSortBus = this.handleSort.bind(this, "bus");
    this.handleSortMtsBus = this.handleSort.bind(this, "mtsBus");
    this.handleSortMtsFerry = this.handleSort.bind(this, "mtsFerry");
    this.handleSortMtsRail = this.handleSort.bind(this, "mtsRail");
    this.handleSortTotal = this.handleSort.bind(this, "total");
    this.handleSortPercent = this.handleSort.bind(this, "percent");
  }

  handleSort(column) {
    let direction = "ascending";
    if (this.state.column === column && this.state.direction === "ascending") {
      direction = "descending";
    }

    this.setState({ column, direction });
  }

  render() {
    const { hftsAlgorithm, stops, districts, stopField } = this.props;
    const { column, direction } = this.state;

    const districtsWithStopCounts = getStopsByDistrict(
      hftsAlgorithm,
      stops,
      districts,
      stopField
    );
    const stateTotal = districtsWithStopCounts.reduce(
      (total, district) => total + district.total,
      0
    );

    districtsWithStopCounts.sort((a, b) => {
      let aValue = column === "percent" ? a.total : a[column];
      let bValue = column === "percent" ? b.total : b[column];

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toUpperCase();
        bValue = bValue.toUpperCase();
      }

      if (aValue > bValue) return direction === "ascending" ? 1 : -1;
      if (bValue > aValue) return direction === "ascending" ? -1 : 1;
      return 0;
    });

    return (
      <div style={{ marginLeft: "auto", marginRight: "auto", width: "800px" }}>
        <Table celled structured collapsing sortable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                rowSpan={2}
                sorted={column === "id" ? direction : null}
                onClick={this.handleSortId}
              >
                District
              </Table.HeaderCell>
              <Table.HeaderCell
                rowSpan={2}
                sorted={column === "memberLastName" ? direction : null}
                onClick={this.handleSortMember}
              >
                Member
              </Table.HeaderCell>
              <Table.HeaderCell rowSpan={2}>Location</Table.HeaderCell>
              <Table.HeaderCell
                rowSpan={2}
                singleLine={false}
                sorted={column === "bus" ? direction : null}
                onClick={this.handleSortBus}
              >
                High Frequency <br /> Bus Stops
              </Table.HeaderCell>
              <Table.HeaderCell colSpan={3}>
                Major Transit Stops
              </Table.HeaderCell>
              <Table.HeaderCell
                rowSpan={2}
                sorted={column === "total" ? direction : null}
                onClick={this.handleSortTotal}
              >
                Total Stops
              </Table.HeaderCell>
              <Table.HeaderCell
                rowSpan={2}
                sorted={column === "percent" ? direction : null}
                onClick={this.handleSortPercent}
              >
                % of All Stops
              </Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              <Table.HeaderCell
                sorted={column === "mtsBus" ? direction : null}
                onClick={this.handleSortMtsBus}
              >
                Bus
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === "mtsFerry" ? direction : null}
                onClick={this.handleSortMtsFerry}
              >
                Ferry
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={column === "mtsRail" ? direction : null}
                onClick={this.handleSortMtsRail}
              >
                Rail
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {districtsWithStopCounts.map(
              ({
                id,
                memberFirstName,
                memberLastName,
                party,
                description,
                bus,
                mtsBus,
                mtsFerry,
                mtsRail,
                total
              }) => (
                <Table.Row key={id}>
                  <Table.Cell>{id}</Table.Cell>
                  <Table.Cell singleLine={false}>
                    {memberFirstName} {memberLastName} {party && `(${party})`}
                  </Table.Cell>
                  <Table.Cell singleLine={false}>{description}</Table.Cell>
                  <Table.Cell>{bus}</Table.Cell>
                  <Table.Cell>{mtsBus}</Table.Cell>
                  <Table.Cell>{mtsFerry}</Table.Cell>
                  <Table.Cell>{mtsRail}</Table.Cell>
                  <Table.Cell>{total}</Table.Cell>
                  <Table.Cell>
                    {(total * 100 / stateTotal).toFixed(1)}%
                  </Table.Cell>
                </Table.Row>
              )
            )}
          </Table.Body>
        </Table>
      </div>
    );
  }
}

function getStopsByDistrict(hftsAlgorithm, allStops, districts, stopField) {
  const districtsById = new Map();
  districts
    .map(district =>
      Object.assign({}, district, {
        bus: 0,
        mtsFerry: 0,
        mtsRail: 0,
        total: 0
      })
    )
    .forEach(district => districtsById.set(district.id, district));

  allStops.forEach(({ [stopField]: districtId, types }) => {
    // if no district for the stop, forget it.
    if (!districtId) {
      return;
    }

    if (types.includes(hftsAlgorithm)) {
      districtsById.get(districtId).bus++;
    }
    if (types.includes(STOP_TYPE_MTS_FERRY)) {
      districtsById.get(districtId).mtsFerry++;
    }
    if (types.includes(STOP_TYPE_MTS_RAIL)) {
      districtsById.get(districtId).mtsRail++;
    }
    if (
      types.includes(hftsAlgorithm) ||
      types.includes(STOP_TYPE_MTS_FERRY) ||
      types.includes(STOP_TYPE_MTS_RAIL)
    ) {
      districtsById.get(districtId).total++;
    }
  });
  return [...districtsById.values()];
}
