/*
  For details on these options, read SERVER.md

  Basic options:

  workingDirectory - where to keep temporary files (required)
  storagePath - where to keep generated audio/videos (required)
  fonts - a list of custom fonts (see THEMES.md for details)
  maxUploadSize - the maximum audio upload size, in bytes

  Fancy server options:

  s3Bucket - a bucket to store generated audio/videos.  If storagePath is also set, it will store files at s3://[s3Bucket]/[storagePath]/
  redisHost - a redis host name/address to use for tracking jobs (e.g. "1.2.3.4" or "127.0.0.1")
  worker - if this is truthy, the server will add jobs to a queue. Otherwise, it will render videos on the spot itself

*/

var path = require("path");
var workingDirectory = process.env.WORKING_DIRECTORY || path.join(__dirname, "..", "tmp");
var storagePath = process.env.STORAGE_PATH || path.join(__dirname, "..", "media");
var s3Bucket = process.env.S3_BUCKET;
var redisHost = process.env.REDIS_HOST;
var worker = process.env.USE_WORKERS;

module.exports = {
  workingDirectory: workingDirectory,
  storagePath: storagePath,
  fonts: [
    { family: "Source Sans Pro", file: path.join(__dirname, "fonts", "SourceSansPro-Regular.ttf") },
    { family: "Source Sans Pro", file: path.join(__dirname, "fonts", "SourceSansPro-Light.ttf"), weight: 300 },
    { family: "Source Sans Pro", file: path.join(__dirname, "fonts", "SourceSansPro-Bold.ttf"), weight: "bold" },
    { family: "Source Sans Pro", file: path.join(__dirname, "fonts", "SourceSansPro-Italic.ttf"), style: "italic" },
    { family: "Source Sans Pro", file: path.join(__dirname, "fonts", "SourceSansPro-BoldItalic.ttf"), weight: "bold", style: "italic" }
  ],
  s3Bucket: s3Bucket,
  redisHost: redisHost,
  worker: worker 
};
