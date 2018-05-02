import React from "react";
import { Container, Divider, Icon } from "semantic-ui-react";
import { Link, withRouter } from "react-router-dom";
import logo from "./CAYIMBY-logo.png";

function PDFMenuItemForUrl({ location }) {
  const match = location.pathname.match(/^\/(senate|assembly)\/(\d+)$/);
  if (match) {
    const house = match[1];
    const district = parseInt(match[2]);
    return (
      <div className="menuItem">
        <a
          href={
            process.env.PUBLIC_URL +
            `/pdfs/SB-827-${house === "assembly" ? "Assembly" : "Senate"}-${
              match[2]
            }.pdf`
          }
        >
          PDF Version
        </a>
      </div>
    );
  }

  return null;
}

const PDFMenuItem = withRouter(PDFMenuItemForUrl);

export default ({ children }) => {
  return (
    <React.Fragment>
      <style>
        {`
          body {
            -webkit-print-color-adjust: exact;
          }
          .background {
            min-height: 100vh;
            background-color: white;
          }
          @media only screen and (min-width: 500px) {
            .background {
              background-color: #F4F6FA;
              padding-top: 1em;
              padding-bottom: 1em;
            }
          }
          .innerBackground {
            min-height: 100vh;
            background-color: white;
            padding-top: 0.5em;
            padding-bottom: 2em;
            padding-left: 0em;
            padding-right: 0em;
            text-align: center;
          }
          @media only screen and (min-width: 500px) {
            .innerBackground {
              box-shadow: 0px 0px 5px 1px gray;
              border-radius: 8px;
            }
          }
          @media (min-width: 500px) {
            .innerBackground {
              padding-top: 0.5em;
              padding-bottom: 3em;
              padding-left: 2em;
              padding-right: 2em;
            }
          }
          .menuItem {
            display: inline-block;
            padding: 7px 10px 0px 10px;
          }
          @media print {
            .topMenu, .topMenuDivider {
              display: none;
            }
          }
        `}
      </style>
      <div className="background">
        <Container className="innerBackground">
          <div style={{ marginBottom: 5 }} className="topMenu">
            <div className="menuItem">
              <Link to="/">Home</Link>
            </div>
            <div className="menuItem">
              <Link to="/state">Statewide Impact</Link>
            </div>
            <div className="menuItem">
              <Link to="/about-us">About Us</Link>
            </div>
            <div className="menuItem">
              <Link to="/methodology">Methodology</Link>
            </div>
            <div className="menuItem">
              <a href="https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=201720180SB827">
                SB 827 Text
              </a>
            </div>
            <div className="menuItem">
              <a href="https://cayimby.org/">CA YIMBY Main Site</a>
            </div>
            <PDFMenuItem />
          </div>
          <Divider className="topMenuDivider" />
          <div
            style={{
              width: 300,
              height: 80,
              marginLeft: "auto",
              marginRight: "auto",
              marginTop: "1.5em"
            }}
          >
            <img width="300" height="80" src={logo} />
          </div>
          {children}
          <div style={{ textAlign: "center", paddingTop: "2em" }}>
            <Icon name="home" size="huge" color="blue" />
            <Icon name="train" size="huge" color="green" />
            <Icon name="home" size="huge" color="blue" />
            <Icon name="bus" size="huge" color="green" />
            <Icon name="home" size="huge" color="blue" />
          </div>
          <div style={{ textAlign: "center", paddingTop: "1em" }}>
            Programmed by volunteers. Website paid for by California YIMBY.
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};
