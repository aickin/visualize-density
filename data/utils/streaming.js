const fs = require("fs");
const stream = require("stream");
const split2 = require("split2");
const through2 = require("through2");
const readline = require("readline");

// Write a geojson FeatureCollection with one feature per line
// ("newline delimited") to make read streaming possible.
function stringifyFeatureCollection(features) {
  return [
    "{",
    `"type":"FeatureCollection",`,
    `"features":[`,
    features.map(feature => JSON.stringify(feature)).join(",\n"),
    "]",
    "}"
  ].join("\n");
}

// batch
function batch(batchSize) {
  let batchBuffer = [];
  return through2.obj(
    (item, encoding, callback) => {
      batchBuffer.push(item);
      if (batchBuffer.length >= batchSize) {
        callback(null, batchBuffer);
        batchBuffer = [];
      } else {
        callback();
      }
    },
    callback => {
      if (batchBuffer.length) {
        callback(null, batchBuffer);
      } else {
        callback();
      }
    }
  );
}

// Parse a newline delimited geojson FeatureCollection at the specified path:
// - handleFeature(feature) will be called for each feature
async function streamFeatureCollectionFile(path, handleFeature) {
  const readStream = fs.createReadStream(path, { encoding: "utf8" });

  const split = split2();

  const parse = through2.obj((line, encoding, callback) => {
    if (line.slice(-1) === ",") {
      line = line.slice(0, -1);
    }
    if (line[0] === "{" && line.slice(-1) === "}") {
      callback(null, JSON.parse(line));
    } else {
      callback();
    }
  });

  const handleFeatures = through2.obj((features, encoding, callback) => {
    Promise.all(features.map(handleFeature)).then(() => callback());
  });

  return new Promise((resolve, reject) => {
    readStream.on("close", resolve);
    readStream
      .pipe(split)
      .pipe(parse)
      .pipe(batch(16))
      .pipe(handleFeatures);
  });
}

// Create a geojson FeatureCollection writer:
// - call writer.writeFeature(feature) to write a feature
// - call writer.end() to when you are finished writing
function createFeatureCollectionWriter(path) {
  const OPEN = `{\n"type": "FeatureCollection",\n"features": [\n`;
  const SEPARATOR = `,\n`;
  const CLOSE = `\n]\n}`;

  const writeArgs = { encoding: "utf8" };
  const stream = fs.createWriteStream(path, writeArgs);
  stream.write(OPEN);

  let numLinesWritten = 0;
  const writeFeature = feature => {
    const firstLine = numLinesWritten++ == 0;
    const line = (firstLine ? "" : SEPARATOR) + JSON.stringify(feature);
    return stream.write(line);
  };

  const onDrain = callback => {
    stream.once("drain", callback);
  };

  const drain = () => {
    return new Promise((resolve, reject) => {
      onDrain(resolve);
    });
  };

  const end = () => {
    stream.write(CLOSE);
    stream.end();
  };

  return {
    stream,
    writeFeature,
    onDrain,
    drain,
    end
  };
}

module.exports = {
  batch,
  stringifyFeatureCollection,
  streamFeatureCollectionFile,
  createFeatureCollectionWriter
};
