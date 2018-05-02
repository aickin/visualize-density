import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  withRouter
} from "react-router-dom";
import "semantic-ui-css/semantic.min.css";

import ScrollToTop from "./ScrollToTop";
import PageTemplate from "./PageTemplate";
import HomePage from "./HomePage";
import AboutUsPage from "./AboutUsPage";
import MethodologyPage from "./MethodologyPage";
import StatePage from "./StatePage";
import { SenateDistrictPage, AssemblyDistrictPage } from "./DistrictPage";
import NotFoundPage from "./NotFoundPage";

class AnalyticsListener extends Component {
  constructor() {
    super();
    this.state = {
      unlisten: null
    };
  }

  listenToHistory(history) {
    return history.listen((location, action) => {
      // back button shouldn't trigger a GA hit.
      if (action === "PUSH" && window.gtag) {
        window.gtag("config", "UA-114530396-1", {
          page_location: `https://sb827.info${location.pathname}${
            location.search
          }`,
          page_path: `${location.pathname}${location.search}`
        });
      }
    });
  }

  componentDidMount() {
    if (this.props.history) {
      this.setState({
        unlisten: this.listenToHistory(this.props.history)
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.history !== this.props.history) {
      if (this.state.unlisten) {
        this.state.unlisten();
      }
      this.setState({
        unlisten: nextProps.history && this.listenToHistory(nextProps)
      });
    }
  }

  render() {
    return this.props.children;
  }
}

const AnalyticsListenerWithContext = withRouter(AnalyticsListener);

class App extends Component {
  render() {
    return (
      <Router>
        <ScrollToTop>
          <AnalyticsListenerWithContext>
            <PageTemplate>
              <Switch>
                <Route exact path="/" component={HomePage} />
                <Route exact path="/about-us" component={AboutUsPage} />
                <Route exact path="/methodology" component={MethodologyPage} />
                <Route exact path="/state" component={StatePage} />
                <Route
                  exact
                  path="/senate/:id(\d+)"
                  component={SenateDistrictPage}
                />
                <Route
                  exact
                  path="/assembly/:id(\d+)"
                  component={AssemblyDistrictPage}
                />
                <Route component={NotFoundPage} />
              </Switch>
            </PageTemplate>
          </AnalyticsListenerWithContext>
        </ScrollToTop>
      </Router>
    );
  }
}

export default App;
