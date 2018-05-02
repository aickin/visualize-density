import React from "react";
import { Header, Icon } from "semantic-ui-react";

export default ({ children }) => (
  <div style={{ textAlign: "left", paddingTop: "3em" }}>
    <Header size="medium">
      <Icon name="question circle" color="blue" />
      {children}
    </Header>
  </div>
);
