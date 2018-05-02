/** A legend for the zoning map, as well as a definition of color schemes. */

import React from "react";

export const HEIGHT_LIMIT = [
  { min: 0, max: 45, color: "#fc8f59", opacity: 0.6 },
  { min: 45, max: 85, color: "#ffffbf", opacity: 0.6 },
  { min: 85, max: Infinity, color: "#91bfdb", opacity: 0.6 }
];

export const PARKING = [
  { min: 0, max: 0.5, color: "#91bfdb", opacity: 0.6 },
  { min: 0.5, max: 1, color: "#ffffbf", opacity: 0.6 },
  { min: 1, max: Infinity, color: "#fc8f59", opacity: 0.6 }
];

export const DENSITY = [
  { min: 0, max: 10, color: "#fc8f59", opacity: 0.6 },
  { min: 10, max: 50, color: "#ffffbf", opacity: 0.6 },
  { min: 50, max: Infinity, color: "#91bfdb", opacity: 0.6 }
];

export default class Legend extends React.Component {
  render() {
    const { legend, units } = this.props;
    return (
      <div
        style={{
          display: "table",
          position: "relative",
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: "1.5em"
        }}
      >
        <div style={{ display: "table-row" }}>
          {legend.map(({ color }, i) => (
            <div
              style={{
                display: "table-cell",
                backgroundColor: color,
                height: 30,
                width: 75
              }}
              key={`color-${i}`}
            />
          ))}
        </div>
        <div style={{ display: "table-row" }}>
          {legend.map(({ min, max }, i) => (
            <div style={{ display: "table-cell" }} key={`label-${i}`}>
              {max !== Infinity && (
                <React.Fragment>
                  {min}&ndash;{max}
                </React.Fragment>
              )}
              {max === Infinity && <React.Fragment>&gt; {min}</React.Fragment>}
            </div>
          ))}
          {/* Specify units, https://en.wikipedia.org/wiki/Mars_Climate_Orbiter */}
          <div style={{ display: "table-cell" }}>{units}</div>
        </div>
      </div>
    );
  }
}
