const ArgumentParser = require("argparse").ArgumentParser;
const geoargs = require("../utils/geoargs");

const ParcelsProcessor = require("./ParcelsProcessor");
const CityEnricher = require("../population/CityEnricher");
const CensusEnricher = require("../census/CensusEnricher");
const ZoningEnricher = require("../zoning/ZoningEnricher");
const StreetEnricher = require("../streets/StreetEnricher");
const SB827Enricher = require("../transit/SB827Enricher");

const DEFAULT_RADIUS_MILES = 5.0;

const parser = new ArgumentParser();
parser.addArgument("enrichers", { nargs: "+" });
parser.addArgument("--counties", { nargs: "+" });
geoargs.addBBoxArgs(parser);

const args = parser.parseArgs();
const bbox = geoargs.bboxFromArgs(args);
const counties = args.counties ? new Set(args.counties) : null;

const enricherMap = [
  new CityEnricher(),
  new CensusEnricher(),
  new StreetEnricher(),
  new ZoningEnricher(),
  new SB827Enricher()
].reduce((m, e) => ({...m, [e.name]: e}), {});

const enrichers = args.enrichers.map(name => {
  const enricher = enricherMap[name];
  if (!enricher) {
    console.error(`No enricher found for name: ${name}`);
    process.exit();
  }
  return enricher;
});

new ParcelsProcessor({ bbox, enrichers, counties }).run();
