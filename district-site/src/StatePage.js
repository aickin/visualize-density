import React, { Component } from "react";
import { Header } from "semantic-ui-react";
import Disclaimer from "./Disclaimer";
import { StateStopsQuestion } from "./StopsQuestion";
import { StateAreaQuestion } from "./AreaQuestion";
import { StateMapsQuestion } from "./MapsQuestion";

export default class extends Component {
  render() {
    return (
      <React.Fragment>
        <Header size="large">SB 827 Fact Sheet for California</Header>
        <div style={{ textAlign: "left", paddingTop: "1.5em" }}>
          <div style={{ fontSize: "1.2em", lineHeight: 1.42 }}>
            Senate Bill 827 would allow more housing at the state’s vital
            transit hubs, a solution to inadequate supply of housing in urban
            areas, as well as the crushing traffic commutes endured by so many.
            For example, it would allow buildings up to approximately five
            stories within one quarter mile of a rail station, which is about a
            4 minute walk. Along bus lines, SB 827 would not authorize
            additional height, but it would legalize so-called "missing middle"
            housing, such as duplexes and triplexes. SB 827 would retain local
            controls over housing, including all policies related to demolition
            and affordability requirements.
          </div>
          <div
            style={{ fontSize: "1.2em", lineHeight: 1.42, paddingTop: "1.5em" }}
          >
            SB 827 would mean more jobs, more customers, less emissions, cleaner
            air, more homes, more families, and a more affordable California. A
            California for everyone.
          </div>
        </div>
        <StateStopsQuestion />
        <StateAreaQuestion />
        <StateMapsQuestion />
        <Disclaimer />
      </React.Fragment>
    );
  }
}
