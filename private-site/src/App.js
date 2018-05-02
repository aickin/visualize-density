import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import HomePage from "./HomePage";
import ParcelsPage from "./ParcelsPage";
import TransitDataPage from "./TransitDataPage";
import NotFoundPage from "./NotFoundPage";

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/parcels" component={ParcelsPage} />
          <Route exact path="/transit-data" component={TransitDataPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </Router>
    );
  }
}

export default App;
