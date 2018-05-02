import React from "react";
import { Header } from "semantic-ui-react";

export default () => (
  <React.Fragment>
    <Header size="huge">Can I Interview Someone About This Site?</Header>
    <div style={{ textAlign: "left", fontSize: "1.2em", lineHeight: 1.42 }}>
      <div style={{ paddingTop: "1.5em" }}>
        If you are a journalist looking to interview an advocate about the
        contents of this site, please contact <strong>Louis Mirante</strong>,
        Legislative and Partnerships Director at CA YIMBY (<a href="mailto:louis@cayimby.org">
          louis@cayimby.org
        </a>).
      </div>
    </div>
    <Header size="huge">Who Made This Site?</Header>
    <div style={{ textAlign: "left", fontSize: "1.2em", lineHeight: 1.42 }}>
      <div style={{ paddingTop: "1.5em" }}>
        This site was created by a team of volunteers, many of whom are
        professionals in the field of GIS analysis, transit software, planning
        software, geography, and web development. We are all supporters of SB
        827, and we gathered together into a team in our spare time to build
        tools to explain SB 827&apos;s impact.
      </div>
      <div style={{ paddingTop: "1.5em" }}>A few of the team members are:</div>
      <ul>
        <li>
          <strong>Sasha Aickin</strong> - Formerly the Chief Technology Officer
          at Redfin
        </li>
        <li>
          <strong>Kuan Butts</strong> - Data Scientist at UrbanFootprint
        </li>
        <li>
          <strong>Matt Conway</strong> - Ph.D. student in Geography at Arizona
          State University
        </li>
        <li>
          <strong>Ryan Gomba</strong> - Co-founder at Even
        </li>
        <li>
          <strong>Hunter Owens</strong> - Co-founder at{" "}
          <a href="https://policyclub.io/">Policy Club</a>
        </li>
        <li>
          <strong>Evan Siroky</strong> - Public Transit Software Developer at
          Conveyal
        </li>
      </ul>
      <div style={{ paddingTop: "1.5em" }}>
        Please note that we provide employer and organization information only
        for identification. We make no claim as to our employers&apos; or
        organizations&apos; positions on SB 827, and our employers did not pay
        us to work on this project.
      </div>
      <div style={{ paddingTop: "1.5em" }}>
        And while all of the code has been created on a volunteer basis, the
        website hosting costs are paid for by California YIMBY.
      </div>
    </div>
  </React.Fragment>
);
