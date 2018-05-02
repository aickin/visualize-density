/** A layer showing zoning. Since the zoning data is large, we tile it. */

import React from "react";
import { Polygon } from "react-google-maps";
import { HEIGHT_LIMIT, PARKING, DENSITY } from "./Legend";

// These must be the same as in processZoning.js
const TILE_SIZE_DEGREES = 0.25;
const CA_WEST = -125; // rough boundaries of California, origins for tile system
const CA_NORTH = 42;

class ZoningTile extends React.Component {
  state = {};

  async componentDidMount() {
    const { x, y } = this.props;

    try {
      // make sure Netlify credentials are passed
      const res = await fetch(`zoning/tiles/${x}/${y}.geo.json`, {
        credentials: "same-origin"
      });
      this.setState({ data: await res.json() });
    } catch (e) {
      // do nothing, probably a 404 from a location with no zoning information
    }
  }

  /** Avoid issues with sluggishness due to frequent re-renders */
  shouldComponentUpdate(nextProps) {
    return (
      nextProps.x !== this.props.x ||
      nextProps.y !== this.props.y ||
      nextProps.layer !== this.props.layer ||
      this.state.data == null
    );
  }

  /** get the color for a particular feature from the legend definition (which comes from Legend.js) */
  colorForFeature(feat) {
    const { layer } = this.props;
    let legend, value;

    if (layer === "height") {
      legend = HEIGHT_LIMIT;
      value = feat.properties.heightLimitFeet;
    } else if (layer === "density") {
      legend = DENSITY;
      value = feat.properties.maxDensityPerAcre;
    } else if (layer === "parking") {
      legend = PARKING;
      value = feat.properties.parkingPerUnit;
    } else return { color: "#f00", opacity: 1 }; // make it very obvious something is wrong

    if (value != null) {
      for (let legendEntry of legend) {
        if (value <= legendEntry.max) {
          const { color, opacity } = legendEntry;
          return { color, opacity };
        }
      }
    }

    // if we're here, we either didn't find a matching entry or value is null
    return { color: "#000000", opacity: 0 };
  }

  /** convert a GeoJSON feature to a GMaps Polygon */
  featToPolygon(feat) {
    const { color, opacity } = this.colorForFeature(feat);
    if (feat.geometry.type === "MultiPolygon") {
      // split to single polygons, recurse
      return (
        <React.Fragment>
          {feat.geometry.coordinates.map(coordinates =>
            this.featToPolygon({
              ...feat,
              geometry: { type: "Polygon", coordinates }
            })
          )}
        </React.Fragment>
      );
    } else if (feat.geometry.type === "Polygon") {
      // remove last coord (dupe of first, not wanted for gmaps), and remap [lng, lat] => {lng, lat}
      return (
        <Polygon
          paths={feat.geometry.coordinates.map(coords =>
            coords.slice(0, -1).map(([lng, lat]) => ({ lng, lat }))
          )}
          options={{
            strokeWeight: 0,
            fillColor: color,
            fillOpacity: opacity
          }}
        />
      );
    } else {
      return null;
    }
  }

  render() {
    return (
      <React.Fragment>
        {this.state.data &&
          this.state.data.features.map(f => this.featToPolygon(f))}}
      </React.Fragment>
    );
  }
}

/** This is just a class that creates a bunch of ZoningTiles that fetch individual GeoJSONs */
export default class ZoningLayer extends React.Component {
  state = {};

  componentWillMount() {
    this.updateBounds(this.props.bounds);
  }

  componentWillReceiveProps(newProps) {
    this.updateBounds(newProps.bounds);
  }

  updateBounds(bounds) {
    if (bounds) {
      this.setState({
        // grab one extra tile all around to account for zones that overlap tile boundaries
        minX:
          Math.floor(
            (bounds.getSouthWest().lng() - CA_WEST) / TILE_SIZE_DEGREES
          ) - 1,
        maxX:
          Math.floor(
            (bounds.getNorthEast().lng() - CA_WEST) / TILE_SIZE_DEGREES
          ) + 1,
        minY:
          Math.floor(
            -(bounds.getNorthEast().lat() - CA_NORTH) / TILE_SIZE_DEGREES
          ) - 1,
        maxY:
          Math.floor(
            -(bounds.getSouthWest().lat() - CA_NORTH) / TILE_SIZE_DEGREES
          ) + 1
      });
    }
  }

  render() {
    const { layer } = this.props;
    const { minX, maxX, minY, maxY } = this.state;

    const allTiles = [];

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        allTiles.push([x, y]);
      }
    }

    return (
      <React.Fragment>
        {allTiles.map(([x, y]) => (
          <ZoningTile x={x} y={y} layer={layer} key={`tile-${x}-${y}`} />
        ))}
      </React.Fragment>
    );
  }
}
