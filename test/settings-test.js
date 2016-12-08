var tape = require("tape"),
    path = require("path"),
    validateSettings = require("../lib/settings/validate-settings.js"),
    validateThemes = require("../lib/settings/validate-themes.js"),
    load = require("../lib/settings/load.js");

tape("Load test", function(test) {

  test.throws(function(){
    load("settings/blah.js");
  }, /No .+ file found/);

  test.throws(function(){
    load("README.md");
  }, /SyntaxError/);

  test.doesNotThrow(function(){
    load("settings/themes.json");
  });

  test.doesNotThrow(function(){
    load("settings/index.js");
  });

  test.end();

});

tape("Required fields", function(test) {

  test.throws(function(){
    validateSettings({});
  }, /settings.workingDirectory is required/);

  test.throws(function(){
    validateSettings({ workingDirectory: 1 });
  }, /settings.workingDirectory is required/);

  test.throws(function(){
    validateSettings({ workingDirectory: "" });
  }, /settings.storagePath/);

  test.throws(function(){
    validateSettings({ workingDirectory: "", storagePath: 1 });
  }, /settings.storagePath/);

  test.doesNotThrow(function(){
    validateSettings({ workingDirectory: path.join(__dirname), storagePath: path.join(__dirname) });
  }, /settings.storagePath/);

  test.doesNotThrow(function(){
    validateSettings({ workingDirectory: path.join(__dirname), s3Bucket: "bucket" });
  }, /settings.storagePath/);

  test.end();

});

tape("Max upload size", function(test) {

  test.throws(function(){
    validateSettings({ workingDirectory: path.join(__dirname), storagePath: path.join(__dirname), maxUploadSize: "a lot" });
  }, /settings.maxUploadSize/);

  test.end();

});

tape("Normalizing paths", function(test) {

  var relative = validateSettings({
    storagePath: "test/",
    workingDirectory: "test/"
  });

  var absolute = validateSettings({
    storagePath: path.join(__dirname),
    workingDirectory: path.join(__dirname)
  });

  var relative2 = validateSettings({
    storagePath: "test",
    workingDirectory: "test"
  });

  test.equal(path.relative(relative.storagePath, absolute.storagePath), "");
  test.equal(path.relative(relative.workingDirectory, absolute.workingDirectory), "");
  test.equal(path.relative(relative2.storagePath, absolute.storagePath), "");
  test.equal(path.relative(relative2.workingDirectory, absolute.workingDirectory), "");

  test.end();

});

tape("Normalize S3 bucket", function(test) {

  var settings = validateSettings({
    s3Bucket: "bucket",
    workingDirectory: "test/"
  });

  test.equal(settings.s3Bucket, "bucket");
  test.equal(settings.storagePath, "");

  var settings = validateSettings({
    s3Bucket: "s3://bucket",
    workingDirectory: "test/"
  });

  test.equal(settings.s3Bucket, "bucket");
  test.equal(settings.storagePath, "");

  settings = validateSettings({
    s3Bucket: "s3://bucket/",
    workingDirectory: "test/"
  });

  test.equal(settings.s3Bucket, "bucket");
  test.equal(settings.storagePath, "");

  settings = validateSettings({
    s3Bucket: "s3://bucket/",
    storagePath: "/",
    workingDirectory: "test/"
  });

  test.equal(settings.s3Bucket, "bucket");
  test.equal(settings.storagePath, "");

  settings = validateSettings({
    s3Bucket: "s3://bucket/",
    storagePath: "dir",
    workingDirectory: "test/"
  });

  test.equal(settings.s3Bucket, "bucket");
  test.equal(settings.storagePath, "dir/");

  settings = validateSettings({
    s3Bucket: "s3://bucket/",
    storagePath: "dir/",
    workingDirectory: "test/"
  });

  test.equal(settings.s3Bucket, "bucket");
  test.equal(settings.storagePath, "dir/");

  settings = validateSettings({
    s3Bucket: "s3://bucket/",
    storagePath: "/dir/",
    workingDirectory: "test/"
  });

  test.equal(settings.s3Bucket, "bucket");
  test.equal(settings.storagePath, "dir/");

  test.end();

});

tape("Fonts", function(test) {

  test.throws(function(){
    validateSettings({
      s3Bucket: "bucket",
      workingDirectory: "test/",
      fonts: 1
    });
  }, /settings.fonts/);

  test.throws(function(){
    validateSettings({
      s3Bucket: "bucket",
      workingDirectory: "test/",
      fonts: {}
    });
  }, /settings.fonts/);

  doesWarn(test, function(){
    validateSettings({
      s3Bucket: "bucket",
      workingDirectory: "test/",
      fonts: [
        {}
      ]
    });
  }, /settings.fonts.+missing/);

  doesWarn(test, function(){
    validateSettings({
      s3Bucket: "bucket",
      workingDirectory: "test/",
      fonts: [
        { family: "" }
      ]
    });
  }, /settings.fonts.+missing/);

  doesWarn(test, function(){
    validateSettings({
      s3Bucket: "bucket",
      workingDirectory: "test/",
      fonts: [
        { file: "" }
      ]
    });
  }, /settings.fonts.+missing/);

  doesWarn(test, function(){
    validateSettings({
      s3Bucket: "bucket",
      workingDirectory: "test/",
      fonts: [
        { file: "notarealfont.ttf", family: "fake" }
      ]
    });
  }, /Font file.+does not exist/);

  doesNotWarn(test, function(){
    validateSettings({
      s3Bucket: "bucket",
      workingDirectory: "test/",
      fonts: [
        { file: "settings/fonts/SourceSansPro-Light.ttf", family: "Source Sans Pro" },
        { file: path.join(__dirname, "..", "settings/fonts/SourceSansPro-Bold.ttf"), family: "Source Sans Pro", weight: "bold" }
      ]
    });
  });

  test.end();

});

tape("Themes", function(test) {

  doesWarn(test, function(){
    validateThemes({});
  }, /No themes/);

  doesWarn(test, function(){
    validateThemes([]);
  }, /No themes/);

  doesWarn(test, function(){
    validateThemes({ "default": {} });
  }, /No themes/);

  doesNotWarn(test, function(){
    validateThemes({ "default": { width: 0, height: 0, framesPerSecond: 0, samplesPerFrame: 0 }, "theme": {} });
  });

  doesNotWarn(test, function(){
    validateThemes({ "default": { framesPerSecond: 0, samplesPerFrame: 0 }, "theme": { width: 0, height: 0 } });
  });

  doesWarn(test, function(){
    validateThemes({ "default": { height: 0, framesPerSecond: 0, samplesPerFrame: 0 }, "theme": {} });
  }, /required property 'width'/);

  doesWarn(test, function(){
    validateThemes({ "default": { width: 0, framesPerSecond: 0, samplesPerFrame: 0 }, "theme": {} });
  }, /required property 'height'/);

  doesWarn(test, function(){
    validateThemes({ "default": { width: 0, height: 0, samplesPerFrame: 0 }, "theme": {} });
  }, /required property 'framesPerSecond'/);

  doesWarn(test, function(){
    validateThemes({ "default": { width: 0, height: 0, framesPerSecond: 0 }, "theme": {} });
  }, /required property 'samplesPerFrame'/);

  doesWarn(test, function(){
    validateThemes({ "default": { width: 0, height: 0, framesPerSecond: 0, samplesPerFrame: 0 }, "theme": { backgroundImage: "doesnotexist.jpg" } });
  }, /Background image.+does not exist/);

  doesNotWarn(test, function(){
    validateThemes({ "default": { width: 0, height: 0, framesPerSecond: 0, samplesPerFrame: 0 }, "theme": { backgroundImage: "subway.jpg" } });
  });

  doesNotWarn(test, function(){
    validateThemes({ "default": { width: 0, height: 0, framesPerSecond: 0, samplesPerFrame: 0 }, "theme": { backgroundImage: path.join(__dirname, "..", "settings/backgrounds/subway.jpg") } });
  });

  test.end();

});

function doesNotWarn(test, fn) {
  doesWarn(test, fn, "");
}

function doesWarn(test, fn, regexp) {

  var output = capture();

  fn();

  if (arguments.length > 2) {
    if (typeof regexp === "string") {
      test.equal(output(), regexp);
    } else {
      test.assert(regexp.test(output()));
    }
  } else {
    test.assert(output().length);
  }

}

function capture(){

  var write = process.stderr.write,
      out = "";

  process.stderr.write = function(str) {
    out += str;
  };

  return function(){
    process.stderr.write = write;
    return out;
  }

}
