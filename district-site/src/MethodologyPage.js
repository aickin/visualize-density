import React from "react";
import { Header } from "semantic-ui-react";

export default () => (
  <React.Fragment>
    <Header size="huge">Our Methodology</Header>
    <div style={{ textAlign: "left", fontSize: "1.2em", lineHeight: 1.42 }}>
      <div style={{ paddingTop: "1.5em" }}>
        Determining how SB 827 affects various parts of California is difficult,
        and we&apos;d like to share our basic methodology so that users of this
        site can understand the uses and limitations of our analysis.
      </div>
      <div style={{ paddingTop: "1.5em" }}>
        In order to build the statistics and maps on this site, we first had to
        find information about transit stops in California. To do that, we
        scoured the web for GTFS feeds of as many California transit agencies as
        we could find. GTFS is the industry standard for machine-readable
        transit schedules. Luckily, almost all transit agencies in the country
        publish a GTFS feed, because publishing a GTFS feed is how you get
        included in Google Maps. In the end, we included schedules from 83
        transit agencies all throughout California in our analysis. The only
        agencies we knowingly did not include are agencies that ended up having
        zero SB 827-eligible stops.
      </div>
      <div style={{ paddingTop: "1.5em" }}>
        Once we had the transit schedule data in hand, we then wrote some code
        to analyze the GTFS feeds to determine which transit stops are subject
        to SB 827. This required us to make some assumptions of what specific
        terms in the law mean, and although we have made what we think are
        reasonable assuptions, it is likely that implementing agencies could end
        up interpreting the law differently. Here are some of the most important
        questions we considered:
      </div>
      <ul>
        <li>
          <strong>What does "high frequency" mean?</strong> The bill says that a
          high frequency bus is one which: (1) has average service intervals of
          no more than 15 minutes during the three peak hours between 6 a.m. to
          10 a.m., inclusive, and the three peak hours between 3 p.m. and 7
          p.m., inclusive, on Monday through Friday. (2) has average service
          intervals of no more than 20 minutes during the hours of 6 a.m. to 10
          p.m., inclusive, on Monday through Friday. (3) has average intervals
          of no more than 30 minutes during the hours of 8 a.m. to 10 p.m.,
          inclusive, on Saturday and Sunday. We decided for our analysis that
          this would mean that the segment of a bus route between stop A and
          stop B is "high frequency" if it had an average per hour count called
          for in the bill for each hour, rather than an overall average. For
          example, if a bus arrives 5 times in the 8 a.m. hour and 3 times in
          the 9 a.m. hour, we consider that to be only 20 minute service on
          average (3 times per hour). Note that under this definition, each
          segment of a bus route is considered separately, so one part of a
          route may count as high frequency, while another portion of the same
          route may not.
        </li>
        <li style={{ paddingTop: "1em" }}>
          <strong>
            When do we count ferry stops as "major transit stops"?
          </strong>{" "}
          For the purposes of this bill, a ferry stop is included under SB 827
          only if it is "served by either a bus or rail transit service". We
          decided that this meant we should include a ferry stop when it had a
          bus stop or rail station within 1000 feet.
        </li>
        <li style={{ paddingTop: "1em" }}>
          <strong>Which day do you look at?</strong> The bill does not say which
          day&apos;s schedule to look at in order to determine which buses are
          "high frequency". We arbitrarily chose to use Monday, January 8th,
          2018 as a representative non-holiday weekday, Sunday, January 7th,
          2018 as a representative Sunday, and Saturday, January 6th, 2018 as a
          representative Saturday.
        </li>
      </ul>
      <div style={{ paddingTop: "1.5em" }}>
        Once we had all the stops that were subject to SB 827, we used GIS
        software to create and union polygons of the appropriate sizes around
        the stops. These polygons are what we used to make the maps and to
        calculate the area covered in each legislative district.
      </div>
      <div style={{ paddingTop: "1.5em" }}>
        Due to the assumptions we have made, the inherent imprecision of
        geographic data, and the fact that this was made by a volunteer team of
        programmers, the information on this website is an estimate and for
        informational purposes only. California YIMBY and its volunteers make no
        guarantee that the data presented here is exact, although we can say
        that we did our best in good faith.
      </div>
    </div>
  </React.Fragment>
);
