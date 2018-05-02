import React from "react";
import Map from "./Map";
import { Polygon, Polyline, InfoWindow } from "react-google-maps";

export default class MapSection extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  render() {
    return (
      <React.Fragment>
        <div className="inner" style={{ color: "black" }}>
          <div style={{ display: "inline-block" }}>
            <div
              style={{
                verticalAlign: "middle",
                width: 20,
                height: 20,
                display: "inline-block",
                border: "solid black 1px",
                backgroundColor: "rgba(0,255,0,0.15)"
              }}
            />{" "}
            Buildings up to 55&apos;
          </div>{" "}
          <div style={{ display: "inline-block" }}>
            <div
              style={{
                verticalAlign: "middle",
                width: 20,
                height: 20,
                display: "inline-block",
                border: "solid black 1px",
                backgroundColor: "rgba(0,0,255,0.15)"
              }}
            />{" "}
            Buildings up to 45&apos;
          </div>{" "}
          <div style={{ display: "inline-block" }}>
            <div
              style={{
                verticalAlign: "middle",
                width: 20,
                height: 20,
                display: "inline-block",
                border: "solid black 1px",
                backgroundColor: "rgba(255,255,0,0.15)"
              }}
            />{" "}
            Parking &amp; density changes only
          </div>
        </div>
        <div style={{ position: "relative" }}>
          {(!this.props.lowRiseShape ||
            !this.props.highRiseShape ||
            !this.props.noRiseShape) && (
            <div
              style={{
                top: "8em",
                position: "absolute",
                zIndex: 1000,
                width: "100%"
              }}
            >
              <div
                style={{
                  padding: "3em 4em 2em 4em",
                  backgroundColor: "white",
                  border: "solid black 1px",
                  verticalAlign: "center",
                  width: "300px",
                  margin: "auto"
                }}
              >
                <h2>Loading Data...</h2>
              </div>
            </div>
          )}
          <Map
            googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyB4YUZxig1ZTwCueNA5JkeGpgaEtFY2xk0"
            loadingElement={<div style={{ height: `700px` }} />}
            containerElement={<div style={{ height: `700px` }} />}
            mapElement={<div style={{ height: `100%` }} />}
          >
            {this.props.busSegments &&
              this.props.busSegments.map((segment, i) => {
                return [
                  <Polyline
                    key={i}
                    path={[segment.from, segment.to]}
                    options={{
                      strokeWeight: 3,
                      strokeColor:
                        this.state.describeSegment === i ? "red" : "black",
                      strokeOpacity: 0.7
                    }}
                    onClick={() => this.setState({ describeSegment: i })}
                  />,
                  this.state.describeSegment === i && (
                    <InfoWindow
                      position={segment.from}
                      onClickClose={() =>
                        this.setState({ describeSegment: null })
                      }
                    >
                      <div>
                        Between {segment.from.name} to {segment.to.name}:
                        <table>
                          <tr>
                            <th style={{ textAlign: "center" }}>Weekday</th>
                            {new Array(24)
                              .fill(0)
                              .map(
                                (_, i) =>
                                  i >= 6 && i < 22 ? (
                                    <th key={i}>{i == 12 ? 12 : i % 12}</th>
                                  ) : null
                              )}
                          </tr>
                          {Object.entries(segment.weekday).map(
                            ([
                              routeId,
                              { name, headsign, stopCountByHour }
                            ]) => (
                              <tr>
                                <td>
                                  {name} towards {headsign}
                                </td>
                                {stopCountByHour.map(
                                  (count, i) =>
                                    i >= 6 && i < 22 ? <td>{count}</td> : null
                                )}
                              </tr>
                            )
                          )}
                          <tr>
                            <th style={{ textAlign: "center" }}>Saturday</th>
                            {new Array(24)
                              .fill(0)
                              .map(
                                (_, i) =>
                                  i >= 8 && i < 22 ? (
                                    <th key={i}>{i == 12 ? 12 : i % 12}</th>
                                  ) : null
                              )}
                          </tr>
                          {Object.entries(segment.saturday).map(
                            ([
                              routeId,
                              { name, headsign, stopCountByHour }
                            ]) => (
                              <tr>
                                <td>
                                  {name} towards {headsign}
                                </td>
                                {stopCountByHour.map(
                                  (count, i) =>
                                    i >= 8 && i < 22 ? <td>{count}</td> : null
                                )}
                              </tr>
                            )
                          )}
                          <tr>
                            <th style={{ textAlign: "center" }}>Sunday</th>
                            {new Array(24)
                              .fill(0)
                              .map(
                                (_, i) =>
                                  i >= 8 && i < 22 ? (
                                    <th key={i}>{i == 12 ? 12 : i % 12}</th>
                                  ) : null
                              )}
                          </tr>
                          {Object.entries(segment.sunday).map(
                            ([
                              routeId,
                              { name, headsign, stopCountByHour }
                            ]) => (
                              <tr>
                                <td>
                                  {name} towards {headsign}
                                </td>
                                {stopCountByHour.map(
                                  (count, i) =>
                                    i >= 8 && i < 22 ? <td>{count}</td> : null
                                )}
                              </tr>
                            )
                          )}
                        </table>
                      </div>
                    </InfoWindow>
                  )
                ];
              })}
            {this.props.noRiseShape && (
              <Polygon
                key="noRise"
                paths={this.props.noRiseShape}
                options={{
                  clickable: false,
                  strokeWeight: 1,
                  fillOpacity: 0.15,
                  fillColor: "yellow"
                }}
              />
            )}
            {this.props.lowRiseShape && (
              <Polygon
                key="lowRise"
                paths={this.props.lowRiseShape}
                options={{
                  clickable: false,
                  strokeWeight: 1,
                  fillOpacity: 0.15,
                  fillColor: "blue"
                }}
              />
            )}
            {this.props.highRiseShape && (
              <Polygon
                key="highRise"
                paths={this.props.highRiseShape}
                options={{
                  clickable: false,
                  strokeWeight: 1,
                  fillOpacity: 0.15,
                  fillColor: "green"
                }}
              />
            )}
          </Map>
        </div>
      </React.Fragment>
    );
  }
}
