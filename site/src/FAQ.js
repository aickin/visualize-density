import React from "react";

export default () => (
  <React.Fragment>
    <section
      className="wrapper"
      style={{ paddingTop: "1em", paddingBottom: "1em", color: "black" }}
    >
      <div class="inner">
        <h2>FAQ</h2>
        <h3 style={{ textAlign: "left" }}>
          Who are you, and who is paying you?
        </h3>
        <p style={{ textAlign: "left" }}>
          My name is <a href="https://twitter.com/xander76">Sasha Aickin</a>. I
          used to be the CTO of Redfin; I&apos;m not currently employed, and I
          do not represent Redfin in any capacity currently. I made this as a
          fun weekend project to learn new tech and learn more about SB 827.
        </p>
        <h3 style={{ textAlign: "left" }}>
          Is this an official map produced by Scott Wiener or advocates of the
          law?
        </h3>
        <p style={{ textAlign: "left" }}>
          Oh, heavens no. I have given money in support of YIMBY Action&apos;s
          ballot proposition, I have known Scott Wiener socially for several
          years, and I consider myself a YIMBY advocate, but{" "}
          <del>I have no official connection to the advocates of this bill</del>,
          and there is absolutely nothing official about this site or map. (<strong
          >
            Update Jan 17, 2018
          </strong>: After publishing this map, I was invited to a meeting with
          the bill&apos;s advocates (CA YIMBY), and I went. So, I&apos;ve
          received snacks and pizza from the advocates and am starting to work
          with them, but this still is not an official map, and I do not speak
          on their behalf.)
        </p>
        <h3 style={{ textAlign: "left" }}>Are you in favor of SB 827?</h3>
        <p style={{ textAlign: "left" }}>
          Absolutely. I do think it could be improved technically, but I think
          it&apos;s directionally right, and it&apos;s one of the first
          proposals I&apos;ve seen that is actually on the right scale of
          ambition to address the state&apos;s housing crisis.
        </p>
        <a name="assumptions" />
        <h3 style={{ textAlign: "left" }}>
          What assumptions did you make in this map?
        </h3>
        <p style={{ textAlign: "left" }}>
          The text of the law is not totally clear on a lot of points,
          especially for a non-lawyer like myself, so I had to make some
          assumptions in order to construct this map. Additionally, some of the
          questions raised by the law were not answerable with the data I had at
          hand, and I had to make simplifying assumptions to solve those.
          Obviously, any of these assumptions could be wrong; if you are an
          expert in the area and see a clear mistake, please{" "}
          <a href="https://twitter.com/xander76">let me know on Twitter</a>.
          Here are some of the big questions that needed answers to generate the
          map:
        </p>
        <div style={{ textAlign: "left" }}>
          <ul>
            <li>
              <strong>
                What does 15 minute service during peak commute hours mean?
              </strong>{" "}
              The law relies heavily on the idea of "high-quality transit
              corridors", which are defined to have fixed route buses at
              "intervals of no more than 15 minutes during peak commute hours".
              I decided that a line segment between two stops counted as a
              "high-quality transit corridor" if, on a non-holiday Monday, buses
              travelled between those stops at least 8 times between 6:30am and
              8:30am and 8 times between 4:30pm and 6:30pm. Note that I did not
              care if there were two or more different routes that travelled
              between those two stops, as long as they added up to 8 trips in
              the morning and 8 trips in the evening.{" "}
              <del>
                Further, I drew a straight line between the two bus stops, which
                may not represent the actual path of the bus between the two
                stops.
              </del>. (<strong>Update Feb 13, 2018</strong>: I understand from
              Senator Wiener&apos;s office that the bill will be changed to use
              high-frequency bus stops, rather than corridors. I have updated
              the map to reflect that.)
            </li>
            <li>
              <strong>What is a "major transit stop"?</strong> The
              <a href="https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=21064.3.&lawCode=PRC">
                law
              </a>{" "}
              that defines a major transit stop says it is &quot;site containing
              an existing rail transit station, a ferry terminal served by
              either a bus or rail transit service, or the intersection of two
              or more major bus routes with a frequency of service interval of
              15 minutes or less during the morning and afternoon peak commute
              periods&quot;. I decided that "rail transit station" would include
              all stops on a light rail, heavy rail, or subway line, even if
              those stops are at surface level in mixed traffic. I did not
              include cable cars. Further, I decided that if two different
              routes <strong>each</strong> visit a stop 8 times between 6:30am
              and 8:30am and 8 times between 4:30pm and 6:30pm on a non-holiday
              Monday, then that stop is a major transit stop, even if the two
              routes are sharing part of their path (i.e. they are going down
              the street in the same direction). It&apos;s probable that I may
              have over-counted major transit stops as a result.{" "}
              <del>
                Finally, I did not include ferry terminals in the map because I
                was not sure how to programmatically figure out if they were
                also served by bus or rail service.
              </del>{" "}
              (<strong>Update Jan 17, 2018</strong>: Ferry service has been
              added, thanks to the work of{" "}
              <a href="https://twitter.com/evan_siroky" rel="nofollow">
                @evan_siroky
              </a>.)
            </li>
            <li>
              <strong>How big is a "block"?</strong>{" "}
              <del>
                According to SB 827, properties within "a block" of major
                transit stops get the higher height limits, and the section of
                existing law that defines a block seems to say that it means
                basically what we would think it does colloquially (an area of
                street frontage between intersections), with the caveat that a
                block is a maximum of 1000 feet long. Unfortunately, I do not
                have access to any data on the street grid around major transit
                stops, so I know neither which directions streets radiate from
                those stops nor where the next intersection is. As a simplifying
                assumption to make up for the missing information, I coded a
                "block" to <strong>always be a circle of 700 feet</strong>,
                although in reality, a block could be longer or shorter than
                that and is not a circle around the transit stop.
              </del>
              (<strong>Update Mar 14, 2018</strong>: The newly amended version
              of SB 827 does not use the concept of blocks, so this concern is
              now moot.)
            </li>
          </ul>
        </div>
        <h3 style={{ textAlign: "left" }}>
          What transit services are missing from this map?
        </h3>
        <p style={{ textAlign: "left" }}>
          It turns out that there are a <strong>lot</strong> of transit services
          in California, and I included data from the following:
        </p>
        <div style={{ textAlign: "left" }}>
          <ul>
            <li>AC Transit</li>
            <li>Alhambra Community Transit</li>
            <li>Altamont Corridor Express</li>
            <li>Amtrak</li>
            <li>Anaheim Resort Transportation</li>
            <li>Antelopte Valley Transit Authority</li>
            <li>Avalon Transit</li>
            <li>Balboa Island Ferry</li>
            <li>BART</li>
            <li>Beach Cities Transit</li>
            <li>Blue and Gold Fleet</li>
            <li>Butte Regional Transit</li>
            <li>Burbank Bus</li>
            <li>Caltrain</li>
            <li>Capitol Corridor</li>
            <li>Carson Circuit</li>
            <li>Catalina Express</li>
            <li>City of Commerce Transportation Department</li>
            <li>City of Elk Grove (e-Tran)</li>
            <li>City of Gardena GTrans</li>
            <li>City of San Luis Obispo Transit</li>
            <li>County Connection</li>
            <li>Culver CityBus</li>
            <li>Dumbarton Express</li>
            <li>Eastern Contra Costa Transit Authority (Tri Delta Transit)</li>
            <li>Eastern Sierra Transit Authority</li>
            <li>El Monte Transit</li>
            <li>Emery Go-Round</li>
            <li>Fairfield and Suisun Transit</li>
            <li>Foothill Transit</li>
            <li>Fresno Area Express</li>
            <li>Glendale Beeline</li>
            <li>Gold Coast Transit</li>
            <li>Golden Empire Transit District</li>
            <li>Golden Gate Transit</li>
            <li>LAX Flyaway</li>
            <li>Livermore Amador Transit Authority</li>
            <li>Long Beach Transit</li>
            <li>Los Angeles County Shuttles</li>
            <li>Los Angeles Department of Transportation</li>
            <li>Los Angeles Metro</li>
            <li>Lynwood Trolley</li>
            <li>Kings Area Rural Transit</li>
            <li>Marin Transit</li>
            <li>Merced The Bus</li>
            <li>Metrolink</li>
            <li>Modesto Area Express</li>
            <li>Montebello Bus Lines</li>
            <li>Monterey Salinas Transit</li>
            <li>Napa Valley Transportation Authority (Vine)</li>
            <li>North County Transit District</li>
            <li>Norwalk Transit System</li>
            <li>Orange Count Transportation Authority</li>
            <li>Pasadena Transit</li>
            <li>Petaluma Transit</li>
            <li>Porterville Transit</li>
            <li>Riverside Transit Agency</li>
            <li>Sacramento Regional Transit</li>
            <li>SamTrans</li>
            <li>San Bernardino OmniTrans</li>
            <li>San Diego Metropolitan Transit System</li>
            <li>San Francisco Municipal Transportation Agency</li>
            <li>San Joaquin Regional Transit District</li>
            <li>San Luis Obispo RTA</li>
            <li>San Luis Obispo Transit</li>
            <li>
              San Mateo County’s Transportation Demand Management Agency (South
              SF - Oyster Point Ferry)
            </li>
            <li>Santa Barbara Metropolitan Transit District</li>
            <li>Santa Clara Valley Transportation Authority</li>
            <li>Santa Clarita Transit</li>
            <li>Santa Cruz Metro</li>
            <li>Santa Maria Area Transit</li>
            <li>Santa Monica Big Blue Bus</li>
            <li>Santa Rosa CityBus</li>
            <li>Solano County Transit</li>
            <li>Sonoma County Transit</li>
            <li>Sonoma Marin Area Rail Transit</li>
            <li>Stanford Marguerite Shuttle</li>
            <li>Sunline Transit Agency</li>
            <li>Tahoe Transportation District</li>
            <li>Tideline Water Taxi</li>
            <li>Torrance Transit</li>
            <li>Turlock Transit</li>
            <li>Union City Transit</li>
            <li>Unitrans</li>
            <li>Vacaville City Coach</li>
            <li>Victor Valley Transit Authority</li>
            <li>Visalia Transit</li>
            <li>WestCat (Western Contra Costa)</li>
            <li>Yolo County Transportation District</li>
            <li>Yuba-Sutter Transit</li>
          </ul>
        </div>
        <p style={{ textAlign: "left" }}>
          There are many smaller transit agencies whose schedules I skimmed
          online and decided that they would not be covered by SB 827 as
          currently written. There&apos;s a decent chance I got some of that
          wrong, though.
        </p>
        <h3 style={{ textAlign: "left" }}>
          Where can I find the text of SB 827?
        </h3>
        <p style={{ textAlign: "left" }}>
          The State Legislature&apos;s website has{" "}
          <a href="https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=201720180SB827">
            the entire text of SB 827
          </a>{" "}
          as currently proposed.
        </p>
        <h3 style={{ textAlign: "left" }}>
          What should I do if I&apos;ve found a mistake in the map or if I want
          to request another feature?
        </h3>
        <p style={{ textAlign: "left" }}>
          Go ahead and{" "}
          <a href="https://twitter.com/xander76">let me know on Twitter</a>. I
          will do my best to acknowledge and correct mistakes that I can, with
          the caveat that this is a side project that I&apos;m doing for fun in
          my spare time. I do not expect to add many more features to the map
          (because, again: unpaid side project for fun), but that could change
          if there&apos;s something that excites me, so go ahead and let me know
          what you would like to see!
        </p>
        <h3 style={{ textAlign: "left" }}>
          What updates have you made to this site?
        </h3>
        <p style={{ textAlign: "left" }}>
          <div style={{ textAlign: "left" }}>
            <ul>
              <li>
                <strong>Version 1.0.0 (Jan 8, 2018)</strong>: First release.
              </li>
              <li>
                <strong>Version 1.0.1 (Jan 9, 2018)</strong>:
                <ul>
                  <li>
                    Fixed super embarrassing typo; I had spelled "Wiener"
                    incorrectly. Sorry, Scott!
                  </li>
                  <li>Added this updates section to the FAQ.</li>
                </ul>
              </li>
              <li>
                <strong>Version 1.0.2 (Jan 9, 2018)</strong>: Added an update to
                the top of the document to tell readers about a bug which
                over-counted buses, especially in smaller cities.
              </li>
              <li>
                <strong>Version 2.0.0 (Jan 9, 2018)</strong>: Fixed two major
                bugs that overcounted bus routes, particularly in suburbs and
                smaller cities. Thanks to the many folks on Twitter (including{" "}
                <a href="https://twitter.com/paulf917/status/950804494090166273">
                  @paulf917
                </a>,{" "}
                <a href="https://twitter.com/theGreaterMarin/status/950795205652959232">
                  @theGreaterMarin
                </a>, and{" "}
                <a href="https://twitter.com/evan_siroky/status/950764671669190656">
                  @evan_siroky
                </a>) who pointed out that Bakersfield and Santa Cruz seemed
                wrong.
              </li>
              <li>
                <strong>Version 2.0.1 (Jan 9, 2018)</strong>: Made the banner
                image smaller after I noticed it was 2MB. Yikes.
              </li>
              <li>
                <strong>Version 2.1 (Jan 11, 2018)</strong>: Toned down the map
                and polygon colors after a friend told me they were too harsh
                ;).
              </li>
              <li>
                <strong>Version 2.2 (Jan 12, 2018)</strong>: Changed the
                definition of a "block" around major transit stops to be 700
                feet.
              </li>
              <li>
                <strong>Version 3.0 (Jan 13, 2018)</strong>: Added Santa Barbara
                MTD, SMART train, Santa Rosa CityBus, and Amtrak. Thanks to{" "}
                <a
                  href="https://twitter.com/jmunowitch/status/951958571972837376"
                  rel="nofollow"
                >
                  @jmunowitch
                </a>{" "}
                and{" "}
                <a
                  href="https://twitter.com/lnjvr/status/950658325221277696"
                  rel="nofollow"
                >
                  @lnjvr
                </a>{" "}
                for the info on where to find those transit feeds!
              </li>
              <li>
                <strong>Version 3.1 (Jan 14, 2018)</strong>: Added Foothill
                transit. Thanks to{" "}
                <a
                  href="https://twitter.com/calwatch/status/952646676774203392"
                  rel="nofollow"
                >
                  @calwatch
                </a>{" "}
                for the info on where to find the Foothill feed!
              </li>
              <li>
                <strong>Version 3.2 (Jan 17, 2018)</strong>:
                <ul>
                  <li>
                    Added ferry stops near transit. Thanks to{" "}
                    <a href="https://twitter.com/evan_siroky" rel="nofollow">
                      @evan_siroky
                    </a>{" "}
                    for the contribution!
                  </li>
                  <li>
                    Removed update block at top of page, as most folks coming to
                    the site at this point haven&apos;t seen the first map with
                    the errors.
                  </li>
                  <li>
                    Updated FAQ with info that I have now had a meeting with CA
                    YIMBY folks.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Version 3.3 (Jan 25, 2018)</strong>: Added Butte
                Regional Transit and Torrance Transit. Thanks to{" "}
                <a href="https://twitter.com/evan_siroky" rel="nofollow">
                  @evan_siroky
                </a>{" "}
                for the contribution!
              </li>
              <li>
                <strong>Version 3.4 (Jan 29, 2018)</strong>: Added Burbank Bus,
                one more Capitol Corridor stop, City of San Luis Obispo Transit,
                County Connection, Eastern Sierra Transit Authority, Emery
                Go-Round, Fairfield and Suisun Transit, Glendale Beeline, Gold
                Coast Transit, Merced The Bus, Napa Valley Transit Authority
                (Vine), Norwalk Transit System, Petaluma Transit, Santa Maria
                Area Transit, Sunline Transit Agency, Tahoe Transportation
                District, Turlock Transit, Union Ciy Transit, Unitrans,
                Vacaville City Coach, Victor Valley Transit Authority, WestCat
                (Western Contra Costa), Yolo County Transportation District, and
                Yuba-Sutter Transit. Thanks to{" "}
                <a href="https://transitfeeds.com" rel="nofollow">
                  transitfeeds.com
                </a>{" "}
                for much of the data and to{" "}
                <a href="https://twitter.com/evan_siroky" rel="nofollow">
                  @evan_siroky
                </a>{" "}
                for doing the work of integrating the new feeds into the map!
              </li>
              <li>
                <strong>Version 3.5 (Jan 29, 2018)</strong>: Added Alhambra
                Community Transit, Antelope Valley Transit Authority, Beach
                Cities Transit, Carson Circuit, City of Commerce Transportation
                Department, City of Gardena GTrans, Culver CityBus, El Monte
                Transit, LAX Flyaway, Los Angeles County Shuttle, Lynwood
                Trolley, Montebello Bus Lines, Pasadena Transit, and Santa
                Clarita Transit. Thanks to LACMTA for providing the data and to{" "}
                <a href="https://twitter.com/evan_siroky" rel="nofollow">
                  @evan_siroky
                </a>{" "}
                for doing the work of integrating the new feeds into the map!
              </li>
              <li>
                <strong>Version 4.0 (Feb 13, 2018)</strong>: Changed
                high-frequency transit bus <em>corridors</em> to high-frequency
                transit bus <em>stops</em>.
              </li>
              <li>
                <strong>Version 4.1 (Mar 14, 2018)</strong>: The amended version
                of SB 827 no longer uses the idea of "blocks" around major
                transit stops; instead it uses a quarter mile. This version
                implements that change.
              </li>
              <li>
                <strong>Version 4.1.1 (Mar 17, 2018)</strong>: Fixed a bug that
                accidentally added more bus stops to the map (but was live on
                the site for less than a day). Sorry for the mistake!
              </li>
              <li>
                <strong>Version 4.2 (Mar 27, 2018)</strong>: Added analysis of
                frequency-based schedules. Added data for Anaheim Resort
                Transportation, Dumbarton Express, Kings Area Rural Transit (<a
                  href="https://github.com/BlinkTagInc/kart-gtfs"
                  rel="nofollow"
                >
                  thanks to BlinkTagInc
                </a>), Porterville Transit, Tri Delta Transit and Visalia
                Transit. Thanks to{" "}
                <a href="https://twitter.com/evan_siroky" rel="nofollow">
                  @evan_siroky
                </a>{" "}
                for doing the work of integrating the new feeds into the map!
              </li>
              <li>
                <strong>Version 4.2.1 (April 4, 2018)</strong>: Added data for
                City of Elk Grove (e-Tran). Thanks to{" "}
                <a href="https://twitter.com/evan_siroky" rel="nofollow">
                  @evan_siroky
                </a>{" "}
                for doing the work of integrating the new feeds into the map!
              </li>
            </ul>
          </div>
        </p>
      </div>
    </section>
  </React.Fragment>
);
