import React from "react";
import { Link } from "react-router-dom";

export default () => (
  <div style={{ textAlign: "left", paddingTop: "2em" }}>
    The information on this website is an estimate and for informational
    purposes only. California YIMBY and its volunteers make no guarantee that
    the data presented here is exact. For more information on how we created
    this page and the assumptions we made, read about{" "}
    <Link to="/methodology">our methodology</Link>.
  </div>
);
