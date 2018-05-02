// Exports a geometry table in Postgis to GeoJSON
// - optionally specify a bounding box

const path = require("path");
const ArgumentParser = require("argparse").ArgumentParser;
const geoargs = require("./utils/geoargs");
const db = require("./utils/db");
const flatten = require("./utils/flatten");
const streaming = require("./utils/streaming");
const ProgressLogger = require("./utils/progressLogger");

class TableExporter {
  constructor({ tableName, outputPath, bbox }) {
    this._tableName = tableName;
    this._outputPath = outputPath;
    this._writer = streaming.createFeatureCollectionWriter(outputPath);
    this._bbox = bbox;
    this._logger = new ProgressLogger();
    this._paused = false;

    this._handleFeature = this._handleFeature.bind(this);
  }

  async _handleFeature(feature) {
    this._logger.increment();
    const ok = this._writer.writeFeature({
      ...feature,
      properties: flatten(feature.properties)
    });
    if (!ok && !this._paused) {
      this._paused = true;
      await this._writer.drain();
      this._paused = false;
    }
  }

  async run() {
    console.log(`Exporting ${this._tableName} data...`);
    this._logger.start();

    await db.streamFeatures(this._tableName, this._bbox, this._handleFeature);

    this._logger.finish();
    this._writer.end();
    console.log("Finishing up...");
  }
}

const parser = new ArgumentParser();
parser.addArgument("tableName");
parser.addArgument("outputPath");
geoargs.addBBoxArgs(parser);
const args = parser.parseArgs();

const tableName = args.tableName;
const outputPath = path.resolve(args.outputPath);
const bbox = geoargs.bboxFromArgs(args);

new TableExporter({ tableName, outputPath, bbox }).run();
