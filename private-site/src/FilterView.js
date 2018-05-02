import React from "react";
import { Checkbox, Dropdown } from "semantic-ui-react";

import Legend, { PARKING, HEIGHT_LIMIT, DENSITY } from "./Legend";
import RadiusSelect from "./RadiusSelect";

import { stopTypes } from "@aickin/visualize-density-common";

const {
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
  STOP_TYPE_HIGH_FREQUENCY_BUS_3X_6AM_10PM
} = stopTypes;

const hftsAlgorithmOptions = [
  {
    text: "4 trips/hr 6:30-8:30am & 4:30-6:30pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS
  },
  {
    text: "6 trips/hr 7am-6pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_6X_7AM_6PM
  },
  {
    text: "6 trips/hr 7am-8pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_6X_7AM_8PM
  },
  {
    text: "6 trips/hr 7am-10pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_6X_7AM_10PM
  },
  {
    text: "5 trips/hr 7am-6pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_5X_7AM_6PM
  },
  {
    text: "5 trips/hr 7am-8pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_5X_7AM_8PM
  },
  {
    text: "5 trips/hr 7am-10pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_5X_7AM_10PM
  },
  {
    text: "4 trips/hr 7am-6pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_6PM
  },
  {
    text: "4 trips/hr 7am-8pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_8PM
  },
  {
    text: "4 trips/hr 7am-10pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_4X_7AM_10PM
  },
  {
    text: "3 trips/hr 7am-6pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_3X_7AM_6PM
  },
  {
    text: "3 trips/hr 7am-8pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_3X_7AM_8PM
  },
  {
    text: "3 trips/hr 7am-10pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_3X_7AM_10PM
  },
  {
    text: "6 trips/hr 6am-6pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_6X_6AM_6PM
  },
  {
    text: "6 trips/hr 6am-8pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_6X_6AM_8PM
  },
  {
    text: "6 trips/hr 6am-10pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_6X_6AM_10PM
  },
  {
    text: "5 trips/hr 6am-6pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_5X_6AM_6PM
  },
  {
    text: "5 trips/hr 6am-8pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_5X_6AM_8PM
  },
  {
    text: "5 trips/hr 6am-10pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_5X_6AM_10PM
  },
  {
    text: "4 trips/hr 6am-6pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_6PM
  },
  {
    text: "4 trips/hr 6am-8pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_8PM
  },
  {
    text: "4 trips/hr 6am-10pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_4X_6AM_10PM
  },
  {
    text: "3 trips/hr 6am-6pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_3X_6AM_6PM
  },
  {
    text: "3 trips/hr 6am-8pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_3X_6AM_8PM
  },
  {
    text: "3 trips/hr 6am-10pm",
    value: STOP_TYPE_HIGH_FREQUENCY_BUS_3X_6AM_10PM
  }
];

class FilterView extends React.Component {
  render() {
    const filters = this.props.filters;

    const mtsChecked =
      filters.stopTypes.has(STOP_TYPE_MTS_FERRY) &&
      filters.stopTypes.has(STOP_TYPE_MTS_RAIL);

    const mtsIndeterminate =
      !mtsChecked &&
      (filters.stopTypes.has(STOP_TYPE_MTS_FERRY) ||
        filters.stopTypes.has(STOP_TYPE_MTS_RAIL));

    return (
      <div>
        <div
          style={{
            marginTop: "1em",
            marginBottom: "1em",
            display: "grid",
            gridTemplateColumns: "50px 145px 130px 130px",
            gridTemplateRows: "auto",
            gridTemplateAreas: `". . headTall headShort"
            "busCheck busCheck busTall ."
            "mtsCheck mtsCheck mtsTall mtsShort"
            ". mtsFerryCheck mtsFerryCheck mtsFerryCheck"
            ". mtsRailCheck mtsRailCheck mtsRailCheck"
            "busAlgoLabel busAlgoLabel busAlgoDropdown busAlgoDropdown"
            "coastalZoneCheck coastalZoneCheck . ."
            `,
            gridRowGap: "12px",
            gridColumnGap: "4px",
            justifyContent: "center",
            alignContent: "center"
          }}
        >
          <div style={{ gridArea: "headTall", justifySelf: "center" }}>
            <strong>55' / 85' height</strong>
          </div>
          <div style={{ gridArea: "headShort", justifySelf: "center" }}>
            <strong>45' / 55' height</strong>
          </div>
          <div
            style={{
              gridArea: "busCheck",
              justifySelf: "left",
              alignSelf: "center"
            }}
          >
            <Checkbox
              checked={filters.stopTypes.has(STOP_TYPE_HIGH_FREQUENCY_BUS)}
              onChange={(event, data) =>
                this._onMtsTypeToggle(
                  [STOP_TYPE_HIGH_FREQUENCY_BUS],
                  data.checked
                )
              }
              label="High Frequency Bus Stops"
            />
          </div>
          <div style={{ gridArea: "busTall" }}>
            <RadiusSelect
              disabled={!filters.stopTypes.has(STOP_TYPE_HIGH_FREQUENCY_BUS)}
              value={filters.hftsBufferFeet}
              onChange={this._onHftsChange}
            />
          </div>
          <div
            style={{
              gridArea: "mtsCheck",
              justifySelf: "left",
              alignSelf: "center"
            }}
          >
            <Checkbox
              checked={mtsChecked}
              indeterminate={mtsIndeterminate}
              onChange={(event, data) => {
                this._onMtsTypeToggle(
                  [STOP_TYPE_MTS_FERRY, STOP_TYPE_MTS_RAIL],
                  data.checked
                );
              }}
              label="Major Transit Stops"
            />
          </div>
          <div style={{ gridArea: "mtsTall" }}>
            <RadiusSelect
              disabled={!mtsChecked && !mtsIndeterminate}
              value={filters.mtsTallBufferFeet}
              onChange={this._onMtsTallChange}
            />
          </div>
          <div style={{ gridArea: "mtsShort" }}>
            <RadiusSelect
              disabled={!mtsChecked && !mtsIndeterminate}
              value={filters.mtsShortBufferFeet}
              onChange={this._onMtsShortChange}
            />
          </div>
          <div
            style={{
              gridArea: "mtsFerryCheck",
              justifySelf: "left",
              alignSelf: "center"
            }}
          >
            <Checkbox
              checked={filters.stopTypes.has(STOP_TYPE_MTS_FERRY)}
              onChange={(event, data) =>
                this._onMtsTypeToggle([STOP_TYPE_MTS_FERRY], data.checked)
              }
              label="Ferries"
            />
          </div>
          <div
            style={{
              gridArea: "mtsRailCheck",
              justifySelf: "left",
              alignSelf: "center"
            }}
          >
            <Checkbox
              checked={filters.stopTypes.has(STOP_TYPE_MTS_RAIL)}
              onChange={(event, data) =>
                this._onMtsTypeToggle([STOP_TYPE_MTS_RAIL], data.checked)
              }
              label="Rail Stations"
            />
          </div>
          <div
            style={{
              gridArea: "busAlgoLabel",
              justifySelf: "left",
              alignSelf: "center"
            }}
          >
            <label>High Frequency Stop Rule</label>
          </div>
          <div
            style={{
              gridArea: "busAlgoDropdown",
              justifySelf: "left",
              alignSelf: "center"
            }}
          >
            <Dropdown
              fluid
              selection
              options={hftsAlgorithmOptions}
              value={filters.hftsAlgorithm}
              onChange={this._onHftsAlgorithmChange}
            />
          </div>
          <div
            style={{
              gridArea: "coastalZoneCheck",
              justifySelf: "left",
              alignSelf: "center"
            }}
          >
            <Checkbox
              checked={filters.showCoastalZone}
              onChange={this._onShowCoastalZoneChanged}
              label="Coastal zone"
            />
          </div>
        </div>
        <div>
          <Checkbox
            checked={filters.showZoning}
            onChange={this._onShowZoningChanged}
            label="Zoning"
          />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          {this._renderZoning()}
        </div>
      </div>
    );
  }

  _renderZoning() {
    const filters = this.props.filters;
    if (!filters.showZoning) {
      return false;
    }
    if (!this.props.canShowZoningAtZoomLevel) {
      return (
        <div>
          <i>Zoom in to enable zoning display</i>
        </div>
      );
    }
    return (
      <React.Fragment>
        <Checkbox
          radio
          checked={filters.zoningLayer === "height"}
          name="zoning"
          value="height"
          onChange={this._onShowZoningHeightChanged}
          label="&#127970;&nbsp;Height Limit"
        />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Checkbox
          radio
          checked={filters.zoningLayer === "parking"}
          name="zoning"
          value="parking"
          onChange={this._onShowZoningParkingChanged}
          label="&#128663;&nbsp;Parking"
        />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Checkbox
          radio
          checked={filters.zoningLayer === "density"}
          name="zoning"
          value="density"
          onChange={this._onShowZoningDensityChanged}
          label="&#127960;&nbsp;Density"
        />
        <Legend
          legend={
            filters.zoningLayer === "parking"
              ? PARKING
              : filters.zoningLayer === "density"
                ? DENSITY
                : filters.zoningLayer === "height" ? HEIGHT_LIMIT : null
          }
          units={
            filters.zoningLayer === "parking"
              ? "spaces per 2-bedroom unit"
              : filters.zoningLayer === "density"
                ? "units per acre"
                : filters.zoningLayer === "height" ? "feet" : null
          }
        />
      </React.Fragment>
    );
  }

  // actions

  _onHftsChange = hftsBufferFeet => {
    this._updateFilters({ hftsBufferFeet });
  };

  _onHftsAlgorithmChange = (e, data) => {
    this._updateFilters({ hftsAlgorithm: data.value });
  };

  _onMtsTallChange = mtsTallBufferFeet => {
    this._updateFilters({ mtsTallBufferFeet });
  };

  _onMtsShortChange = mtsShortBufferFeet => {
    this._updateFilters({ mtsShortBufferFeet });
  };

  _onShowZoningChanged = (e, data) => {
    this._updateFilters({ showZoning: data.checked });
  };

  _onShowZoningHeightChanged = (e, data) => {
    data.checked && this._updateFilters({ zoningLayer: "height" });
  };

  _onShowZoningDensityChanged = (e, data) => {
    data.checked && this._updateFilters({ zoningLayer: "density" });
  };

  _onShowZoningParkingChanged = (e, data) => {
    data.checked && this._updateFilters({ zoningLayer: "parking" });
  };

  _onShowCoastalZoneChanged = (event, data) => {
    this._updateFilters({ showCoastalZone: data.checked });
  };

  _onMtsTypeToggle(types, isOn) {
    const stopTypes = new Set(this.props.filters.stopTypes);
    types.forEach(type => {
      if (isOn) {
        stopTypes.add(type);
      } else {
        stopTypes.delete(type);
      }
    });
    this._updateFilters({ stopTypes });
  }

  _updateFilters = diff => {
    this.props.onFiltersChanged({
      ...this.props.filters,
      ...diff
    });
  };
}

export default FilterView;
