import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Header } from "semantic-ui-react";
import NotFoundPage from "./NotFoundPage";
import { DistrictStopsQuestion } from "./StopsQuestion";
import { DistrictAreaQuestion } from "./AreaQuestion";
import { DistrictMapsQuestion } from "./MapsQuestion";
import Disclaimer from "./Disclaimer";
import senateDistricts from "@aickin/visualize-density-data/legislative/senate-districts.json";
import assemblyDistricts from "@aickin/visualize-density-data/legislative/assembly-districts.json";

export class AssemblyDistrictPage extends Component {
  render() {
    const { match } = this.props;
    return (
      <DistrictPage
        id={parseInt(match.params.id, 10)}
        house="Assembly"
        districts={assemblyDistricts}
      />
    );
  }
}

export class SenateDistrictPage extends Component {
  render() {
    const { match } = this.props;
    return (
      <DistrictPage
        id={parseInt(match.params.id, 10)}
        house="Senate"
        districts={senateDistricts}
      />
    );
  }
}

class DistrictPage extends Component {
  render() {
    const { house, id, districts } = this.props;

    // if id isn't between 1 and the number of districts (inclusive), then
    // give a 404 page.
    const NotFoundPageWithContext = withRouter(NotFoundPage);
    if (id < 1 || id > districts.length) return <NotFoundPageWithContext />;

    const district = districts[id - 1];
    return (
      <React.Fragment>
        <Header size="large">
          SB 827 Fact Sheet for {house} District {id}: {district.description}
        </Header>
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
        <DistrictStopsQuestion id={id} house={house} district={district} />
        <DistrictAreaQuestion id={id} house={house} />
        <DistrictMapsQuestion id={id} house={house} />
        <Disclaimer />
      </React.Fragment>
    );
  }
}
