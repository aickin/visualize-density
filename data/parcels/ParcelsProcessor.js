const turf = require("@turf/turf");
const db = require("../utils/db");
const ProgressLogger = require("../utils/progressLogger");

const { PARCELS_TABLE } = require("./model");

class ParcelsProcessor {
  constructor({ bbox, enrichers, counties }) {
    this._bbox = bbox;
    this._counties = counties;
    this._logger = new ProgressLogger();
    this._enrichers = enrichers;

    this._handleFeature = this._handleFeature.bind(this);
  }

  async run() {
    await this._init();
    await this._process();
  }

  async _init() {
    for (let i = 0; i < this._enrichers.length; i++) {
      await this._enrichers[i].init();
    }
  }

  async _process() {
    console.log(
      `Enriching ${
        this._bbox || this._counties ? "partial" : "all"
      } parcel data...`
    );
    this._logger.start();
    await db.streamFeatures(PARCELS_TABLE, this._bbox, this._handleFeature);
    this._logger.finish();
  }

  async _handleFeature(feature) {
    this._logger.increment();

    // skip?

    if (this._counties && !this._counties.has(feature.properties.county)) {
      return;
    }

    // enrich

    let newProps = {};
    for (let i = 0; i < this._enrichers.length; i++) {
      const enricher = this._enrichers[i];

      let properties;
      try {
        properties = await enricher.enrich({ feature });
      } catch (e) {
        console.error("Error during enrichment:", enricher.name, e, feature);
        continue;
      }

      if (properties) {
        newProps[enricher.name] = properties;
        feature.properties = {
          ...feature.properties,
          ...newProps
        };
      }
    }

    // update the new feature

    await db.updateFeatureProperties(
      PARCELS_TABLE,
      feature.properties.id,
      newProps
    );
  }
}

module.exports = ParcelsProcessor;
