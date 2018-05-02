import React from "react";

export default () => (
  <React.Fragment>
    <section
      className="wrapper"
      style={{ paddingTop: "1em", paddingBottom: "1em", color: "black" }}
    >
      <div className="inner">
        <h2>What does this all mean?</h2>
        <p style={{ textAlign: "left" }}>
          So what do all these green and blue shapes over the map mean? To
          understand this, it&apos;s first important to understand what SB 827
          proposes. Essentially SB 827 says that, for areas close to "major
          transit stops" and "high-quality transit corridors", local governments
          cannot impose any of the following on residential development:
        </p>
        <div style={{ textAlign: "left" }}>
          <ul>
            <li>Parking minimums.</li>
            <li>Density (or housing units per parcel) maximums.</li>
            <li>
              Arbitrary design restrictions (e.g. of the form "this building
              isn't pretty enough").
            </li>
          </ul>
        </div>
        <p style={{ textAlign: "left" }}>
          In addition, SB 827 says that in areas very close to transit (a
          quarter mile from a high frequency bus line or one <del>block</del>{" "}
          quarter mile from a major transit stop), local governments have to
          allow buildings of at least 55 feet height on narrow streets and 85
          feet height on wider streets. In areas that are further away, but
          still fairly close to transit (at least half a mile from a "major
          transit stop"), local governments have to allow buildings of at least
          45 feet height on narrow streets and 55 feet height on wide streets.
          On the map above, the green overlay represents areas that might have
          55/85 foot heights under SB 827, and the blue overlay represents areas
          that might have 45/55 foot heights under SB 827. (Again, I stress the
          word <strong>may have</strong>; this is a work in progress, and there
          are certainly errors.) In both green and blue areas, the limits on
          parking minimums, density maximums, and design restrictions would be
          present.
        </p>
        <p style={{ textAlign: "left" }}>
          It&apos; very important to first note that SB 827 does not require
          developers to do anything; it just stops local governments from
          prohibiting developers from doing things. So, developers do not have
          to build up to the 45/55/85 foot height limit in SB 827 impact areas,
          they are free to build developments with parking within the impact
          areas, and they are even free to develop single family homes.
          It&apos;s also important to note that, at least as I read the law as a
          non-lawyer, local governments are still free to impose other zoning
          restrictions, such as eviction controls and inclusionary zoning.
        </p>
      </div>
    </section>
    <section
      className="wrapper"
      style={{ paddingTop: "1em", paddingBottom: "1em", color: "black" }}
    >
      <div className="inner">
        <h2>Three thoughts about SB 827</h2>
        <p style={{ textAlign: "left" }}>
          My first impression from this map is that SB 827 is indeed, as{" "}
          <a href="https://twitter.com/MarketUrbanism/status/949089055727382528">
            @MarketUrbanism has said
          </a>, a{" "}
          <del>
            <strong>very</strong>
          </del>{" "}
          aggressive upzoning proposal. Nearly all of San Francisco would be set
          for upzoning to 85/55 foot heights, as would significant portions of
          Los Angeles, Long Beach, San Diego, Oakland, Berkeley, and, to a
          lesser extent, Sacramento.
          <del>
            More surpising to me, though, is the impact on smaller cities like
            Bakersfield, Santa Cruz, and San Bernardino, which also have a large
            amount of 85/55 foot upzoning.
          </del>{" "}
          (<strong>Update</strong>: I had two major bugs with reading transit
          data in the first version of the map, which caused a major
          over-estimate of how much area was affected. I now believe these
          communities don&apos;t seem to see much impact from SB 827). No matter
          your position on the bill, it is clearly a proposal that is thinking
          big when it comes to the housing problem in our state.
        </p>
        <p style={{ textAlign: "left" }}>
          My second thought, which I came to as I implemented this map, is that
          there are still a lot of technical details that need to be ironed out
          in this law, any of which could radically change the law&apos;s effect
          on local zoning. I found myself{" "}
          <a href="#assumptions">needing to interpret vague language</a> many
          times while making this map, and some of the choices the bill makes
          about which areas it affects are confusing.{" "}
          <del>
            As an example, a project is affected by SB 827 if it is a quarter
            mile from a high-frequency bus <strong>route</strong>, not a quarter
            mile from a bus <strong>stop</strong>. But obviously, living close
            to a bus route only helps if you are close to an actual stop that
            allows you to get on and off the bus, so some areas that are not
            close to stops may get upzoned just because they are near a bus
            route that zooms through their neighborhood. For a particularly
            egregious example of this, take the{" "}
            <a href="https://en.wikipedia.org/wiki/Silver_Line_(Los_Angeles_Metro)">
              LA Metro Silver line
            </a>, a Bus Rapid Transit line in Los Angeles: the El Monte stop and
            Cal State LA stop are about 8 miles apart from each other, with no
            stops in between. While it makes total sense to me to upzone around
            these two stops, it&apos;s very hard for me to see why the 8 miles
            in between should also be upzoned. I expect that if SB 827 goes
            forward, this sort of thing will need to be addressed.
          </del>{" "}
          (<strong>Update Feb 13, 2018</strong>: I understand from Senator
          Wiener&apos;s office that this will be addressed in later revisions of
          the law, so I have switched the map to use bus stops rather than bus
          corridors.)
        </p>
        <p style={{ textAlign: "left" }}>
          My third thought, which is really more of a worry, is that SB 827, if
          passed as currently written, would raise the stakes of transit
          planning tremendously. Relatively straightforward tweaks to bus routes
          in San Francisco like stop elimination have often generated intense
          backlash; with SB 827 I would expect changes to be much more
          controversial. Just imagine if moving a bus line over two blocks or
          increasing the frequency from 20 minutes to 15 minutes not only
          changed transit but also precipitated neighborhood rezonings. It is
          also conceivable that, in a post-SB 827 world, citizens who want lower
          height limits in their neighborhood might focus their energy on
          reducing the extent or frequency of bus service in order to pull areas
          out of SB 827&apos;s purview. I don&apos;t pretend to know what will
          actually happen here, but squashing together two of the most
          contentious urban issues, planning and transportation, will probably
          not make them any less heated.
        </p>
      </div>
    </section>
    <section
      className="wrapper"
      style={{ paddingTop: "1em", paddingBottom: "1em", color: "black" }}
    >
      <div className="inner">
        <h2>Conclusion</h2>
        <p style={{ textAlign: "left" }}>
          SB 827 is the most aggressive bill proposed recently in California to
          address our statewide housing crisis, and if it does pass, my guess is
          that it will look at least somewhat different than it does right now.
          I hope this map contributes in some small way to the public discussion
          on the bill, and I look forward to discussing and debating it with
          y&apos;all <a href="https://twitter.com/xander76">on Twitter</a>.
        </p>
      </div>
    </section>
  </React.Fragment>
);
