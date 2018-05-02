import React, { Component } from "react";
import "semantic-ui-css/semantic.min.css";
import "./App.css";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  GroundOverlay,
  Polyline
} from "react-google-maps";
import stops from "@aickin/visualize-density-data/output/stops";
import coastalZonePaths from "./data/coastal-zone-paths";
import Modal from "react-modal";

import FilterView from "./FilterView";
import LocationSelector from "./LocationSelector";
import RegionTables from "./RegionTables";
import ZoningLayer from "./ZoningLayer";

import { stopTypes } from "@aickin/visualize-density-common";

import { SAN_FRANCISCO } from "./LocationSelector";

const {
  STOP_TYPE_MTS_FERRY,
  STOP_TYPE_MTS_RAIL,
  STOP_TYPE_HIGH_FREQUENCY_BUS
} = stopTypes;

const METERS_PER_FOOT = 0.3048;
const MIN_ZOOM_ZONING = 12;

const Map = withScriptjs(
  withGoogleMap(props => {
    return (
      <GoogleMap {...props} ref={props.onMapMounted}>
        {props.children}
      </GoogleMap>
    );
  })
);

// bounding box for california
const eastLng = -114.13077545166;
const westLng = -124.482009887695;
const northLat = 42.0095024108887;
const southLat = 32.5295219421387;

class App extends Component {
  constructor() {
    super();
    this.state = {
      calculating: true,
      gmapsLoaded: false,
      center: SAN_FRANCISCO.center,
      zoom: SAN_FRANCISCO.zoom,
      filters: {
        hftsAlgorithm: STOP_TYPE_HIGH_FREQUENCY_BUS,
        hftsBufferFeet: 1320,
        mtsTallBufferFeet: 1320,
        mtsShortBufferFeet: 2640,
        stopTypes: new Set([
          STOP_TYPE_MTS_FERRY,
          STOP_TYPE_MTS_RAIL,
          STOP_TYPE_HIGH_FREQUENCY_BUS
        ]),
        zoningLayer: "height",
        showCoastalZone: false
      }
    };
  }

  componentWillMount() {
    // this is so hacky. let's test every 100ms to see if gmaps has loaded.
    const interval = setInterval(() => {
      if (
        window.google &&
        window.google.maps &&
        window.google.maps.geometry &&
        window.google.maps.geometry.spherical
      ) {
        this.setState({ calculating: false, gmapsLoaded: true });
        clearInterval(interval);
      }
    }, 1000);
  }

  jumpTo(location) {
    this.setState(location);
  }

  // figures out the vertical and horizontal radius in degrees for a
  // circle around a point in meters.
  getExtent({ lat, lng }, meters) {
    const computeOffset = window.google.maps.geometry.spherical.computeOffset;
    const northExtent = computeOffset(
      new window.google.maps.LatLng({ lat, lng }),
      meters,
      0
    ).lat();
    const eastExtent = computeOffset(
      new window.google.maps.LatLng({ lat, lng }),
      meters,
      90
    ).lng();

    return {
      latRadius: northExtent - lat,
      lngRadius: eastExtent - lng
    };
  }

  // Google Maps GroundOverlays expect an image in raw lat-lon coordinates,
  // which is then projected to Web Mercator by the Google Maps API. Thus we
  // render an SVG in lat-lon coordinates and allow Google Maps to handle all
  // reprojection and ensuring the image lines up on the ground.
  getDataSvg() {
    const { hftsAlgorithm, stopTypes } = this.state.filters;
    const filteredMajorTransitStops = stops.filter(({ types }) =>
      types.some(
        type =>
          (type === STOP_TYPE_MTS_RAIL || type === STOP_TYPE_MTS_FERRY) &&
          stopTypes.has(type)
      )
    );
    const filteredBusStops = stops.filter(({ types }) =>
      types.some(
        type =>
          type === hftsAlgorithm && stopTypes.has(STOP_TYPE_HIGH_FREQUENCY_BUS)
      )
    );
    return `data:image/svg+xml,<?xml version="1.0" standalone="no"?>
<svg preserveAspectRatio="none" width="${eastLng -
      westLng}" height="${northLat -
      southLat}" version="1.1" xmlns="http://www.w3.org/2000/svg">
  ${filteredMajorTransitStops
    .map(({ lat, lng }) => {
      const { latRadius, lngRadius } = this.getExtent(
        { lat, lng },
        this.state.filters.mtsShortBufferFeet * METERS_PER_FOOT
      );
      return `<ellipse cx="${lng - westLng}" cy="${northLat -
        lat}" rx="${lngRadius}" ry="${latRadius}" stroke="blue" fill="blue" stroke-width="0"/>`;
    })
    .join("")}
  ${filteredBusStops
    .map(({ lat, lng }) => {
      const { latRadius, lngRadius } = this.getExtent(
        { lat, lng },
        this.state.filters.hftsBufferFeet * METERS_PER_FOOT
      );
      return `<ellipse cx="${lng - westLng}" cy="${northLat -
        lat}" rx="${lngRadius}" ry="${latRadius}" stroke="green" fill="green" stroke-width="0"/>`;
    })
    .join("")}
  ${filteredMajorTransitStops
    .map(({ lat, lng }) => {
      const { latRadius, lngRadius } = this.getExtent(
        { lat, lng },
        this.state.filters.mtsTallBufferFeet * METERS_PER_FOOT
      );
      return `<ellipse cx="${lng - westLng}" cy="${northLat -
        lat}" rx="${lngRadius}" ry="${latRadius}" stroke="green" fill="green" stroke-width="0"/>`;
    })
    .join("")}
</svg>`;
  }

  render() {
    return (
      <div className="App">
        <Modal
          ariaHideApp={false}
          isOpen={this.state.calculating}
          style={{
            content: {
              top: "50%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)"
            }
          }}
        >
          Crunching the data...
        </Modal>
        <FilterView
          canShowZoningAtZoomLevel={this.state.zoom >= MIN_ZOOM_ZONING}
          filters={this.state.filters}
          onFiltersChanged={this._onFiltersChanged}
        />
        <LocationSelector onLocationSelected={this._onLocationSelected} />
        <Map
          center={this.state.center}
          zoom={this.state.zoom}
          onZoomChanged={this.onZoomChanged}
          onCenterChanged={this.onCenterChanged}
          onBoundsChanged={this.onBoundsChanged}
          onMapMounted={this.onMapMounted}
          googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyB4YUZxig1ZTwCueNA5JkeGpgaEtFY2xk0&libraries=geometry"
          loadingElement={<div style={{ height: `700px` }} />}
          containerElement={<div style={{ height: `700px` }} />}
          mapElement={<div style={{ height: `100%` }} />}
        >
          {this.state.gmapsLoaded &&
            this.state.filters.showZoning &&
            this.state.zoom >= MIN_ZOOM_ZONING && (
              <ZoningLayer
                layer={this.state.filters.zoningLayer}
                zoom={this.state.zoom}
                bounds={this.state.bounds}
              />
            )}

          {this.state.gmapsLoaded && (
            /* there's a bug in react-google-maps that makes GroundOverlay not update,
            so we have to use a key property */
            <GroundOverlay
              key={`${this.state.filters.mtsShortBufferFeet},${
                this.state.filters.mtsTallBufferFeet
              },${this.state.filters.hftsBufferFeet},${Array.from(
                this.state.filters.stopTypes
              )},${this.state.filters.hftsAlgorithm}`}
              defaultUrl={this.getDataSvg()}
              defaultBounds={{
                east: eastLng,
                west: westLng,
                north: northLat,
                south: southLat
              }}
              defaultOpacity={0.5}
            />
          )}
          {this.state.filters.showCoastalZone &&
            coastalZonePaths.map((path, i) => (
              <Polyline
                key={`coastalZone-${i}`}
                path={path}
                options={{
                  clickable: false,
                  strokeWeight: 2,
                  strokeColor: "pink"
                }}
              />
            ))}
        </Map>
        <div style={{ paddingTop: "1.5em", paddingBottom: "2.5em" }}>
          <RegionTables
            hftsAlgorithm={this.state.filters.hftsAlgorithm}
            stops={stops}
          />
        </div>
      </div>
    );
  }

  // actions

  onZoomChanged = () => {
    this.setState({ zoom: this.map.getZoom() });
  };

  onCenterChanged = () => {
    this.setState({ center: this.map.getCenter() });
  };

  onBoundsChanged = () => {
    this.setState({ bounds: this.map.getBounds() });
  };

  onMapMounted = map => {
    this.map = map;
  };

  _onLocationSelected = location => {
    this.jumpTo({ center: location.center, zoom: location.zoom });
  };

  _onFiltersChanged = filters => {
    this.setState({ filters });
  };
}

export default App;
