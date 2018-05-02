import React, { Component } from "react";
import { withScriptjs, withGoogleMap, GoogleMap } from "react-google-maps";
import mapStyles from "./mapStyles";

class Map extends Component {
  render() {
    return (
      <GoogleMap
        defaultZoom={10}
        defaultCenter={{ lat: 37.7749, lng: -122.3194 }}
        options={{ styles: mapStyles }}
        ref={map => (this.map = map)}
        onBoundsChanged={() => {
          if (this.props.onBoundsChanged) {
            this.props.onBoundsChanged(this.map.getBounds());
          }
        }}
      >
        {this.props.children}
      </GoogleMap>
    );
  }
}

export default withScriptjs(withGoogleMap(Map));
