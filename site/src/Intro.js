import React from "react";

export default () => (
  <React.Fragment>
    <section
      className="wrapper"
      style={{ paddingTop: "1em", paddingBottom: "1em", color: "black" }}
    >
      <div className="inner">
        <p
          style={{
            textAlign: "left",
            color: "black",
            background: "LightGray",
            padding: "1em"
          }}
        >
          <strong style={{ color: "black" }}>Update (April 12, 2018):</strong>{" "}
          Some new amendments were added to SB 827 on April 10th, and the map
          below has been updated with a new zone around bus stops (shown in
          yellow) in which only parking minimums and density are affected by SB
          827, but{" "}
          <strong style={{ color: "black" }}>heights are not affected</strong>.
          Note much of the text of this article is now obsolete with the new
          amendments, and you should basically ignore it. I plan to update the
          text in the next few days, but I wanted to get the map out as quickly
          as possible. And as always, the map may have errors, and I appreciate
          corrections on Twitter at @xander76.
        </p>
        <p style={{ textAlign: "left" }}>
          On January 4th, 2018, California State Senator Scott Wiener{" "}
          <a href="https://artplusmarketing.com/california-needs-a-housing-first-agenda-my-2018-housing-package-1b6fe95e41da">
            announced a series of proposed housing bills
          </a>. By far the most attention has been directed at{" "}
          <a href="https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=201720180SB827">
            Senate Bill 827 (SB 827)
          </a>, which would override local zoning controls on height, density,
          parking minimums, and design review on properties within a certain
          distance of major public transit infrastructure.
        </p>
        <p style={{ textAlign: "left" }}>
          I was really interested what that would look like on the ground in
          California, so I spent a few days attempting to make a map that would
          show how SB 827 would affect zoning as currently proposed. Please note
          that I am not an expert in this area, and that this map{" "}
          <strong>
            should only be used as a beginning point for the policy discussion
            around the bill and not for making any important decisions
          </strong>. I <strong>cannot state strongly enough</strong> that there
          are multiple errors with this map, due to{" "}
          <strong>missing and incorrect data</strong>,{" "}
          <strong>
            probable misinterpretations of the proposed law as written
          </strong>, <strong>bugs in my software</strong>, and multiple other
          reasons.
        </p>
        <p style={{ textAlign: "left" }}>
          <strong style={{ textDecoration: "underline" }}>
            I make no warranties as to the correctness of this map, and by using
            this map, you agree that you understand that.
          </strong>
        </p>
        <p style={{ textAlign: "left" }}>
          That all being said, let&apos;s look at the map! Feel free to play
          with it and scroll around the state, and then join me below the map
          for some discussion of SB 827 and what this map can tell us.
        </p>
      </div>
    </section>
  </React.Fragment>
);
