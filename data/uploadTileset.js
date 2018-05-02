const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const Mapbox = require("mapbox");
const ArgumentParser = require("argparse").ArgumentParser;

const USERNAME = "ca-yimby";
const ACCESS_TOKEN =
  "sk.eyJ1IjoiY2EteWltYnkiLCJhIjoiY2pkampoZnkxMW84bDJxbjlnaDdod2t4aSJ9.aaQmUMEfmoeztMajdqYaDA"; // ca-yimby.admin

const client = new Mapbox(ACCESS_TOKEN);

async function createS3UploadCredentials() {
  const response = await client.createUploadCredentials();
  return response.entity;
}

async function uploadToS3WithCredentials({ tilesetPath, credentials }) {
  const s3 = new AWS.S3({
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    sessionToken: credentials.sessionToken,
    region: "us-east-1"
  });
  return new Promise((resolve, reject) => {
    s3.putObject(
      {
        Bucket: credentials.bucket,
        Key: credentials.key,
        Body: fs.createReadStream(tilesetPath)
      },
      function(err, response) {
        if (err) {
          reject(err);
        } else {
          resolve(credentials.url);
        }
      }
    );
  });
}

async function createUpload({ name, url }) {
  const params = {
    tileset: `${USERNAME}.${name}`,
    name,
    url
  };
  const response = await client.createUpload(params);
  return response.entity;
}

async function checkUpload(id) {
  const check = (resolve, reject) => {
    client.readUpload(id, (err, upload) => {
      if (err) {
        reject(err);
      } else if (upload.progress === 1) {
        resolve();
      } else {
        setTimeout(() => check(resolve, reject), 10000);
      }
    });
  };
  return new Promise(check);
}

async function upload({ name, tilesetPath }) {
  console.log("Creating credentials...");
  const credentials = await createS3UploadCredentials();

  console.log("Uploading to S3...");
  const url = await uploadToS3WithCredentials({ tilesetPath, credentials });

  console.log("Creating upload...");
  const upload = await createUpload({ name, url });

  console.log("Waiting for processing to complete...");
  await checkUpload(upload.id);

  console.log(`Tileset ready: ${upload.tileset}`);
}

const parser = new ArgumentParser();
parser.addArgument("name");
parser.addArgument("tilesetPath");
const args = parser.parseArgs();

upload({
  name: args.name,
  tilesetPath: path.resolve(args.tilesetPath)
});
