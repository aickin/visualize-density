import React from "react";
import { Button } from "semantic-ui-react";

const presetLocations = [
  {
    center: { lat: 34.0522, lng: -118.2437 },
    zoom: 12.1,
    name: "Los Angeles"
  },
  {
    center: { lat: 38.57234, lng: -121.48178 },
    zoom: 13,
    name: "Sacramento"
  },
  {
    center: { lat: 32.73407, lng: -117.14812 },
    zoom: 12.1,
    name: "San Diego"
  },
  {
    center: { lat: 37.3382, lng: -121.8863 },
    zoom: 12.1,
    name: "San Jose"
  },
  {
    center: { lat: 37.76621, lng: -122.43606 },
    zoom: 12.1,
    name: "San Francisco"
  },
  {
    center: { lat: 37.81602, lng: -122.27376 },
    zoom: 13,
    name: "Oakland"
  }
];

export const SAN_FRANCISCO = presetLocations[4];

class LocationSelector extends React.Component {
  constructor() {
    super();

    // make pre-bound functions to give to the button click handlers.
    presetLocations.forEach(location => {
      location.handler = () => this.props.onLocationSelected(location);
    });
  }

  render() {
    return (
      <div style={{ marginTop: "1.5em", marginBottom: "1em" }}>
        {"Jump to: "}
        {presetLocations.map(this._renderLocation)}
      </div>
    );
  }

  _renderLocation(location, i) {
    return (
      <React.Fragment key={i}>
        <Button onClick={location.handler}>{location.name}</Button>{" "}
      </React.Fragment>
    );
  }
}

export default LocationSelector;
