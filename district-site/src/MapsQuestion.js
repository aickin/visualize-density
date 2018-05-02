import React, { Component } from "react";
import { Segment, Dimmer, Loader } from "semantic-ui-react";
import Question from "./Question";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Polygon
} from "react-google-maps";
import { convert } from "@aickin/visualize-density-common";
import styles from "./mapStyles";
import senateDistrictBoundaries from "@aickin/visualize-density-data/legislative/senate-districts.geo";
import assemblyDistrictBoundaries from "@aickin/visualize-density-data/legislative/assembly-districts.geo";

const Map = withScriptjs(
  withGoogleMap(props => {
    return (
      <GoogleMap {...props} ref={props.onMapMounted}>
        {props.children}
      </GoogleMap>
    );
  })
);

const getDistrictGeo = (house, id) => {
  let districts = null;
  switch (house) {
    case "Senate":
      districts = senateDistrictBoundaries;
      break;
    case "Assembly":
      districts = assemblyDistrictBoundaries;
      break;
    default:
      throw new Error(
        `The value for house has to be "Senate" or "Assembly"; the value is ${house}`
      );
  }

  const district = districts.features.filter(
    district => district.properties.NAME === id.toString()
  )[0];

  return convert.polygonToPointArray(district);
};

function getBounds(path) {
  let result = {
    east: -180,
    west: 180,
    north: -90,
    south: 90
  };

  path.forEach(poly =>
    poly.forEach(point => {
      result.south = Math.min(point.lat, result.south);
      result.north = Math.max(point.lat, result.north);
      result.west = Math.min(point.lng, result.west);
      result.east = Math.max(point.lng, result.east);
    })
  );

  return result;
}

const MapKey = () => (
  <div style={{ color: "black", paddingBottom: "1em" }}>
    <div style={{ display: "inline-block" }}>
      <div
        style={{
          verticalAlign: "middle",
          width: 20,
          height: 20,
          display: "inline-block",
          border: "solid black 1px",
          backgroundColor: "rgba(0,255,0,0.2)"
        }}
      />{" "}
      Buildings up to 5 stories
    </div>{" "}
    <div style={{ display: "inline-block" }}>
      <div
        style={{
          verticalAlign: "middle",
          width: 20,
          height: 20,
          display: "inline-block",
          border: "solid black 1px",
          backgroundColor: "rgba(0,0,255,0.2)"
        }}
      />{" "}
      Buildings up to 4 stories
    </div>{" "}
    <div style={{ display: "inline-block" }}>
      <div
        style={{
          verticalAlign: "middle",
          width: 20,
          height: 20,
          display: "inline-block",
          border: "solid black 1px",
          backgroundColor: "rgba(255,255,0,0.2)"
        }}
      />{" "}
      Height limits are unaffected
    </div>
  </div>
);

const LoadingMapElement = () => (
  <div style={{ height: `680px` }}>
    <Segment>
      <Dimmer active>
        <Loader size="huge">Loading Map Data</Loader>
      </Dimmer>
      <div style={{ height: `680px` }} />
    </Segment>
  </div>
);

class MapWithSB827Polys extends Component {
  constructor() {
    super();
    this.state = {};
  }

  async componentWillMount() {
    const [noRiseShape, lowRiseShape, highRiseShape] = await Promise.all([
      import("@aickin/visualize-density-data/output/no_rise_shape"),
      import("@aickin/visualize-density-data/output/low_rise_shape"),
      import("@aickin/visualize-density-data/output/high_rise_shape")
    ]);

    this.setState({
      noRiseShape,
      lowRiseShape,
      highRiseShape
    });
  }

  render() {
    const { onMapMounted, children } = this.props;
    const { noRiseShape, lowRiseShape, highRiseShape } = this.state;
    if (noRiseShape && lowRiseShape && highRiseShape) {
      return (
        <Map
          googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyB4YUZxig1ZTwCueNA5JkeGpgaEtFY2xk0"
          loadingElement={<LoadingMapElement />}
          containerElement={<div style={{ height: `680px` }} />}
          mapElement={<div style={{ height: `100%` }} />}
          options={{ styles }}
          onMapMounted={map => onMapMounted && onMapMounted(map)}
        >
          <Polygon
            key="noRise"
            paths={noRiseShape}
            options={{
              clickable: false,
              strokeWeight: 1,
              fillOpacity: 0.2,
              fillColor: "yellow"
            }}
          />
          <Polygon
            key="lowRise"
            paths={lowRiseShape}
            options={{
              clickable: false,
              strokeWeight: 1,
              fillOpacity: 0.2,
              fillColor: "blue"
            }}
          />
          <Polygon
            key="highRise"
            paths={highRiseShape}
            options={{
              clickable: false,
              strokeWeight: 1,
              fillOpacity: 0.2,
              fillColor: "green"
            }}
          />
          {children}
        </Map>
      );
    }

    // the data isn't loaded yet; leave a loading map element there.
    return <LoadingMapElement />;
  }
}

export class DistrictMapsQuestion extends Component {
  render() {
    const { id, house } = this.props;
    const districtPath = getDistrictGeo(house, id);

    const bounds = getBounds(districtPath);

    return (
      <div style={{ pageBreakInside: "avoid" }}>
        <Question>
          What specific parts of {house} District {id} will be affected?
        </Question>
        <div style={{ paddingTop: "1.5em" }}>
          <MapKey />
          <MapWithSB827Polys onMapMounted={map => map && map.fitBounds(bounds)}>
            <Polygon
              paths={districtPath}
              options={{
                clickable: false,
                strokeWeight: 5,
                strokeColor: "black",
                fillOpacity: 0
              }}
            />
          </MapWithSB827Polys>
        </div>
      </div>
    );
  }
}

export function StateMapsQuestion() {
  const californiaBounds = {
    south: 32.5,
    north: 42,
    east: -114.14,
    west: -124.4
  };

  return (
    <React.Fragment>
      <Question>What specific parts of California will be affected?</Question>
      <div style={{ paddingTop: "1.5em" }}>
        <MapKey />
        <MapWithSB827Polys
          onMapMounted={map => map && map.fitBounds(californiaBounds)}
        />
      </div>
    </React.Fragment>
  );
}
