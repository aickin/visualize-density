import React, { Component } from "react";
import { Header, Dropdown, Divider, Button } from "semantic-ui-react";
import { Link } from "react-router-dom";
import senateDistricts from "@aickin/visualize-density-data/legislative/senate-districts.json";
import assemblyDistricts from "@aickin/visualize-density-data/legislative/assembly-districts.json";

export default class extends Component {
  render() {
    const { history } = this.props;
    return (
      <div style={{ textAlign: "center", paddingTop: "2em" }}>
        <Header size="huge">How will SB 827 affect my district?</Header>
        <Header size="large">
          Assembly District{" "}
          <Dropdown
            selection
            value={0}
            options={[
              { text: "", value: 0 },
              ...assemblyDistricts.map(({ id, memberLastName }) => ({
                text: `${id} — ${memberLastName || "(Vacant)"}`,
                value: id
              }))
            ]}
            onChange={(_, target) =>
              target.value && history.push(`/assembly/${target.value}`)
            }
          />
        </Header>
        <Header size="large">
          Senate District{" "}
          <Dropdown
            selection
            value={0}
            options={[
              { text: "", value: 0 },
              ...senateDistricts.map(({ id, memberLastName }) => ({
                text: `${id} — ${memberLastName || "(Vacant)"}`,
                value: id
              }))
            ]}
            onChange={(_, target) =>
              target.value && history.push(`/senate/${target.value}`)
            }
          />
        </Header>
        <div
          style={{ width: "70%", minWidth: 350, margin: "25px auto 25px auto" }}
        >
          <Divider horizontal>or</Divider>
        </div>
        <Link to="/state">
          <Button size="big" primary>
            See the Statewide Impact
          </Button>
        </Link>
      </div>
    );
  }
}
