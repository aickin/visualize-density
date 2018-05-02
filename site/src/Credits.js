import React from "react";

export default () => (
  <section
    className="wrapper"
    style={{ paddingTop: "1em", paddingBottom: "1em", color: "black" }}
  >
    <div class="inner">
      <h2>Credits</h2>
      <div style={{ textAlign: "left" }}>
        <ul>
          <li>
            Website styling modified from the{" "}
            <a href="https://templated.co/theory" rel="nofollow">
              Theory template
            </a>{" "}
            from{" "}
            <a href="https://templated.co/" rel="nofollow">
              templated.co
            </a>{" "}
            and licensed under Creative Commons.
          </li>
          <li>
            Transit data pulled from many different transit service websites and{" "}
            <a href="https://transitfeeds.com/" rel="nofollow">
              transitfeeds.com
            </a>.
          </li>
          <li>
            Polygon manipulation performed by the excellent{" "}
            <a href="http://turfjs.org" rel="nofollow">
              turf.js library
            </a>. Seriously, that library is awesome.
          </li>
          <li>Banner image is a modified snap from the SF Muni bus map.</li>
          <li>Google Maps remains a towering technical achievement.</li>
          <li>
            The map styling is{" "}
            <a
              href="https://snazzymaps.com/style/15/subtle-grayscale"
              rel="nofollow"
            >
              Subtle Grayscale
            </a>{" "}
            by Paulo Avila licensed under CC0 from{" "}
            <a href="https://snazzymaps.com/" rel="nofollow">
              snazzymaps.com
            </a>.
          </li>
        </ul>
      </div>
    </div>
  </section>
);
