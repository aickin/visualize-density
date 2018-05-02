import React, { Component } from "react";
import ReactMapboxGl, {
  Layer,
  GeoJSONLayer,
  Source,
  Popup
} from "react-mapbox-gl";
import { Dropdown, Checkbox } from "semantic-ui-react";

import LocationSelector from "./LocationSelector";

const Map = ReactMapboxGl({
  accessToken:
    "pk.eyJ1IjoiY2EteWltYnkiLCJhIjoiY2pkamV1cmU0MWp1YTJ3bjlpeHVkdnR1YyJ9.JALJnRjP07nxKnqcGXWijw",
  hash: true
});

const KeyItem = ({ color, text }) => (
  <React.Fragment>
    <div style={{ display: "inline-block" }}>
      <div
        style={{
          verticalAlign: "middle",
          width: 20,
          height: 20,
          display: "inline-block",
          border: "solid black 1px",
          backgroundColor: color
        }}
      />{" "}
      {text}
    </div>{" "}
  </React.Fragment>
);

const ZoningKey = () => {
  return (
    <div style={{ paddingTop: 10 }}>
      <KeyItem color="#CCE7EC" text="< 1 story change" />
      <KeyItem color="#CCECD4" text="+1 story" />
      <KeyItem color="#9DDEAF" text="+2 stories" />
      <KeyItem color="#85CB99" text="+3 stories" />
      <KeyItem color="#67B37D" text="+4 stories" />
      <KeyItem color="#39874F" text="+5 stories" />
      <KeyItem color="#F8E5EB" text="No zoning info" />
      <KeyItem color="transparent" text="Not affected by SB827" />
    </div>
  );
};
const IncomeCutoffKey = () => {
  return (
    <div style={{ paddingTop: 10 }}>
      <KeyItem color="#39874F" text="85 foot height" />
      <KeyItem color="#85CB99" text="55 foot height" />
      <KeyItem color="#CCECD4" text="45 foot height" />
      <KeyItem color="#F8E5EB" text="No income data" />
      <KeyItem color="transparent" text="Not affected by SB827" />
    </div>
  );
};

const incomeCutoffOptions = [
  { text: "$0", value: 0 },
  { text: "$10,000", value: 10000 },
  { text: "$20,000", value: 20000 },
  { text: "$30,000", value: 30000 },
  { text: "$40,000", value: 40000 },
  { text: "$50,000", value: 50000 },
  { text: "$60,000", value: 60000 },
  { text: "$70,000", value: 70000 },
  { text: "$80,000", value: 80000 },
  { text: "$90,000", value: 90000 },
  { text: "$100,000", value: 100000 },
  { text: "$110,000", value: 110000 },
  { text: "$120,000", value: 120000 },
  { text: "$130,000", value: 130000 },
  { text: "$140,000", value: 140000 },
  { text: "$150,000", value: 150000 },
  { text: "$160,000", value: 160000 },
  { text: "$170,000", value: 170000 },
  { text: "$180,000", value: 180000 },
  { text: "$190,000", value: 190000 },
  { text: "$200,000", value: 200000 },
  { text: "$210,000", value: 210000 },
  { text: "$220,000", value: 220000 },
  { text: "$230,000", value: 230000 },
  { text: "$240,000", value: 240000 }
];

export default class ParcelsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      center: [-117.11467, 32.73074],
      zoom: [12],
      popup: null,
      incomeCutoff: 0,
      mapMode: "zoning"
    };
  }

  render() {
    return (
      <React.Fragment>
        {this._renderMap(this.state.mapMode, this.state.incomeCutoff)}
        {this._renderControls(this.state.mapMode, this.state.incomeCutoff)}
      </React.Fragment>
    );
  }

  _renderMap(mapMode, incomeCutoff) {
    const mapStyle = {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    };
    return (
      <Map
        containerStyle={mapStyle}
        style={"mapbox://styles/mapbox/light-v9"} // eslint-disable-line react/style-prop-object
        center={this.state.center}
        zoom={this.state.zoom}
      >
        {/* this._renderDevStreetsLayer() */}
        {/* this._renderDevParcelsLayer(mapMode, incomeCutoff) */}
        {this._renderParcelsLayer(mapMode, incomeCutoff)}
        {this._renderSegmentLayer()}
        {this._renderStopsLayer()}
        {this._renderPopup()}
      </Map>
    );
  }

  _renderControls(mapMode, incomeCutoff) {
    const controlsStyle = {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      backgroundColor: "white",
      paddingLeft: 15,
      paddingRight: 15,
      paddingBottom: 30
    };
    return (
      <div style={controlsStyle}>
        <LocationSelector onLocationSelected={this._onLocationSelected} />
        <div>
          <Checkbox
            radio
            label="Show Zoning (Particular Cities Only)"
            name="mapModeRadioGroup"
            value="zoning"
            checked={mapMode === "zoning"}
            onChange={(e, { value }) => this.setState({ mapMode: "zoning" })}
          />
        </div>
        <div>
          <Checkbox
            radio
            label="Show Income Cutoff:"
            name="mapModeRadioGroup"
            value="income"
            checked={mapMode === "income"}
            onChange={(e, { value }) => this.setState({ mapMode: "income" })}
          />
          <Dropdown
            selection
            options={incomeCutoffOptions}
            value={incomeCutoff}
            onChange={(_, data) => this.setState({ incomeCutoff: data.value })}
            disabled={mapMode !== "income"}
          />
        </div>
        {mapMode === "zoning" ? <ZoningKey /> : <IncomeCutoffKey />}
      </div>
    );
  }

  _renderPopup() {
    const popup = this.state.popup;
    if (!popup) {
      return null;
    }
    const feature = popup.features[0];
    return (
      <Popup
        coordinates={popup.coordinates}
        onClick={() => this.setState({ popup: null })}
      >
        {Object.keys(feature.properties).map((key, i) => {
          return (
            <React.Fragment key={i}>
              <span>{`${key}: ${feature.properties[key]}`}</span>
              <br />
            </React.Fragment>
          );
        })}
      </Popup>
    );
  }

  // development layers

  _renderDevStreetsLayer() {
    let data;
    try {
      data = require("./data/dev-streets.geo");
    } catch (e) {}
    return (
      <GeoJSONLayer
        data={data}
        linePaint={{
          "line-width": 1,
          "line-color": "black"
        }}
      />
    );
  }

  _renderDevParcelsLayer(mapMode, incomeCutoff) {
    let data;
    try {
      data = require("./data/dev-parcels.geo");
    } catch (e) {}

    const colorStyle =
      mapMode === "zoning"
        ? this._deltaHeightFillColor()
        : this._sb827WithIncomeCutoffFillColor(incomeCutoff);
    return (
      <GeoJSONLayer
        data={data}
        fillOnClick={this._onParcelClick}
        fillPaint={{
          "fill-color": colorStyle,
          "fill-outline-color": "rgba(0, 0, 0, 0.1)"
        }}
      />
    );
  }

  // production layers

  _renderParcelsLayer(mapMode, incomeCutoff) {
    return (
      <React.Fragment>
        <Source
          id="parcels"
          tileJsonSource={{
            type: "vector",
            url: "mapbox://ca-yimby.parcels-2018-04-05"
          }}
          onSourceLoaded={e => {
            e.map.on("click", "parcels", this._onParcelClick);
          }}
        />
        <Layer
          id={"parcels"}
          type={"fill"}
          sourceID={"parcels"}
          sourceLayer={"enrichedgeo"}
          before={"waterway-label"}
          paint={{
            "fill-color":
              mapMode === "zoning"
                ? this._deltaHeightFillColor()
                : this._sb827WithIncomeCutoffFillColor(incomeCutoff),
            "fill-outline-color": "rgba(0,0,0,0.1)"
          }}
        />
      </React.Fragment>
    );
  }

  _renderSegmentLayer() {
    return (
      <React.Fragment>
        <Source
          id="segments"
          tileJsonSource={{
            type: "vector",
            url: "mapbox://ca-yimby.segments"
          }}
        />
        <Layer
          id={"segments"}
          type={"line"}
          sourceID={"segments"}
          sourceLayer={"segments"}
          before={"waterway-label"}
          layout={{
            "line-join": "round",
            "line-cap": "round"
          }}
          paint={{
            "line-color": "hsla(327, 84%, 72%, 0.5)",
            "line-width": 1
          }}
        />
      </React.Fragment>
    );
  }

  _renderStopsLayer() {
    return (
      <React.Fragment>
        <Source
          id="stops"
          tileJsonSource={{
            type: "vector",
            url: "mapbox://ca-yimby.stops"
          }}
        />
        <Layer
          id={"stops"}
          type={"circle"}
          sourceID={"stops"}
          sourceLayer={"stops"}
          before={"waterway-label"}
          paint={{
            "circle-opacity": 0.5,
            "circle-color": this._stopsCircleColor(),
            "circle-radius": this._stopsCircleRadius()
          }}
        />
      </React.Fragment>
    );
  }

  // styles

  _stopsCircleColor() {
    return [
      "case",
      ["<=", ["number", ["get", "class"]], 1],
      "#62A1FF",
      [">=", ["number", ["get", "class"]], 2],
      "#CC9BFF",
      "red"
    ];
  }

  _stopsCircleRadius() {
    return [
      "interpolate",
      ["linear"],
      ["zoom"],
      8,
      [
        "case",
        ["<=", ["number", ["get", "class"]], 1],
        1,
        [">=", ["number", ["get", "class"]], 2],
        1,
        1
      ],
      12,
      [
        "case",
        ["<=", ["number", ["get", "class"]], 1],
        4,
        [">=", ["number", ["get", "class"]], 2],
        2,
        1
      ],
      14,
      [
        "case",
        ["<=", ["number", ["get", "class"]], 1],
        10,
        [">=", ["number", ["get", "class"]], 2],
        6,
        1
      ]
    ];
  }

  _streetWidthFillColor() {
    return [
      "step",
      ["number", ["get", "street.width"]],
      "gray",
      0,
      "orange",
      70,
      "red"
    ];
  }

  _maxUnitsFillColor() {
    return [
      "case",
      // not residential
      [
        "all",
        ["!", ["boolean", ["get", "zoning.singleFamily"], false]],
        ["!", ["boolean", ["get", "zoning.multiFamily"], false]]
      ],
      "transparent",
      // no limit
      ["==", ["get", "zoning.maxUnits"], null],
      "red",
      // affected
      [
        "step",
        ["number", ["get", "zoning.maxUnits"]],
        "yellow",
        1,
        "#CCECD4",
        2,
        "#9DDEAF",
        3,
        "#85CB99",
        4,
        "#67B37D",
        5,
        "#39874F"
      ]
    ];
  }

  _deltaHeightFillColor() {
    return [
      "case",
      // not affected by SB 827
      ["==", ["get", "sb827.minMaxHeightFeet"], null],
      "transparent",
      // no zoning info on the parcel.
      [
        "all",
        ["==", ["get", "zoning.singleFamily"], null],
        ["==", ["get", "zoning.multiFamily"], null]
      ],
      "#F8E5EB",
      // not residential
      [
        "all",
        ["!", ["boolean", ["get", "zoning.singleFamily"], false]],
        ["!", ["boolean", ["get", "zoning.multiFamily"], false]]
      ],
      "transparent",
      // no height data
      ["==", ["get", "zoning.maxHeightFeet"], null],
      "#F8E5EB",
      // affected
      [
        "step",
        ["number", ["get", "sb827.deltaHeightFeet"]],
        "#CCE7EC",
        10,
        "#CCECD4",
        20,
        "#9DDEAF",
        30,
        "#85CB99",
        40,
        "#67B37D",
        50,
        "#39874F"
      ]
    ];
  }

  _sb827WithIncomeCutoffFillColor(incomeCutoff) {
    return [
      "case",
      // not affected by SB 827
      ["==", ["get", "sb827.minMaxHeightFeet"], null],
      "transparent",
      // not sure what the income is; flag with a different color
      ["==", ["get", "census.income.income"], null],
      "#F8E5EB",
      // below minimum income threshold
      ["<=", ["to-number", ["get", "census.income.income"]], incomeCutoff],
      "transparent",
      // affected by SB 827 and above threshold
      ["==", ["to-number", ["get", "sb827.minMaxHeightFeet"]], 45],
      "#CCECD4",
      ["==", ["to-number", ["get", "sb827.minMaxHeightFeet"]], 55],
      "#85CB99",
      ["==", ["to-number", ["get", "sb827.minMaxHeightFeet"]], 85],
      "#39874F",
      "red" // fallback to indicate an error
    ];
  }

  _jjjFillColor() {
    return [
      "case",
      // not affected by SB 827
      ["==", ["get", "sb827.minMaxHeightFeet"], null],
      "transparent",
      // not residential
      [
        "all",
        ["!", ["boolean", ["get", "zoning.singleFamily"], false]],
        ["!", ["boolean", ["get", "zoning.multiFamily"], false]]
      ],
      "transparent",
      // no max units
      ["==", ["get", "zoning.maxUnits"], null],
      "#B7ECDD",
      // affected
      ["step", ["number", ["get", "zoning.maxUnits"]], "#DDC2EC", 5, "#B7ECDD"]
    ];
  }

  // actions

  _onLocationSelected = ({ center, zoom }) => {
    this.setState({ center: [center.lng, center.lat], zoom: [zoom] });
  };

  _onParcelClick = e => {
    this.setState({
      popup: {
        coordinates: e.lngLat.toArray(),
        features: e.features
      }
    });
  };
}
