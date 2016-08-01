module.exports = function(settings) {

  var s3 = settings.s3Bucket ? require("./remote")(settings.s3Bucket, settings.storagePath) : require("./fake")(settings.storagePath);

  return {
    uploadAudio: s3.upload,
    uploadVideo: s3.upload,
    downloadAudio: s3.download,
    getURL: s3.getURL,
    cleanFiles: s3.clean
  };

}
