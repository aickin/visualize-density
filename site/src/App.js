import React, { Component } from "react";
import "./App.css";
import busmap from "./busmap.png";
import Intro from "./Intro";
import Discussion from "./Discussion";
import FAQ from "./FAQ";
import Credits from "./Credits";
import MapSection from "./MapSection";

class App extends Component {
  constructor() {
    super();
    this.state = { showBusLines: window.location.search === "?waitbutwhy" };
  }

  async componentDidMount() {
    const [noRiseShape, lowRiseShape, highRiseShape] = await Promise.all([
      import("@aickin/visualize-density-data/output/no_rise_shape"),
      import("@aickin/visualize-density-data/output/low_rise_shape"),
      import("@aickin/visualize-density-data/output/high_rise_shape")
    ]);

    this.setState({ noRiseShape, lowRiseShape, highRiseShape });

    if (this.state.showBusLines) {
      this.setState({
        busSegments: await fetch("/all_segments.json").then(response =>
          response.json()
        )
      });
    }
  }

  render() {
    return (
      <div className="App">
        <header id="header" style={{ top: "1em" }}>
          <div className="inner">
            <a href="index.html" className="logo">
              Visualize Transit-Rich Housing
            </a>
            <nav id="nav">
              <a href="index.html">Home</a>
              <a href="#map">Map</a>
              <a href="#discussion">Discussion</a>
              <a href="#faq">FAQ</a>
            </nav>
            <a href="#navPanel" className="navPanelToggle">
              <span className="fa fa-bars" />
            </a>
          </div>
        </header>
        <section
          id="banner"
          style={{
            paddingTop: "4em",
            paddingBottom: "1em",
            backgroundImage: `url(${busmap})`
          }}
        >
          <h1>What would SB 827 really look like?</h1>
        </section>
        <Intro />
        <a name="map" />
        <MapSection
          noRiseShape={this.state.noRiseShape}
          lowRiseShape={this.state.lowRiseShape}
          highRiseShape={this.state.highRiseShape}
          busSegments={this.state.busSegments}
        />
        <a name="discussion" />
        <Discussion />
        <hr />
        <a name="faq" />
        <FAQ />
        <Credits />
      </div>
    );
  }
}

export default App;
