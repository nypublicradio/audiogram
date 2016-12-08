var tape = require("tape"),
    path = require("path"),
    fs = require("fs"),
    queue = require("d3").queue,
    request = require("supertest");

var serverSettings = require("../lib/settings/");

serverSettings.workingDirectory = path.join(__dirname, "tmp", "working");
serverSettings.storagePath = path.join(__dirname, "tmp", "storage");
serverSettings.maxUploadSize = 100000;
serverSettings.worker = true;

var server = require("../server");

var longSample = path.join(__dirname, "data", "glazed-donut.mp3"),
    shortSample = path.join(__dirname, "data", "short.mp3");

tape("Server static", function(test) {

  request(server)
    .get("/")
    .expect(200)
    .expect("Content-Type", /html/)
    .end(function(err, res){
      test.error(err);
      test.assert(res.text.match(/audiogram/i));
      test.end();
    });

});

tape("Server static JS", function(test) {

  request(server)
    .get("/js/bundle.js")
    .expect(200)
    .end(function(err, res){
      test.error(err);
      test.end();
    });

});

tape("404 1", function(test) {

  request(server)
    .get("/settings/index.js")
    .expect(404)
    .end(function(err, res){
      test.error(err);
      test.end();
    });

});

tape("404 2", function(test) {

  request(server)
    .get("/something.html")
    .expect(404)
    .end(function(err, res){
      test.error(err);
      test.end();
    });

});

tape("404 3", function(test) {

  request(server)
    .get("/fonts/something")
    .expect(404)
    .end(function(err, res){
      test.error(err);
      test.end();
    });

});

tape("Font stylesheet", function(test) {

  request(server)
    .get("/fonts/fonts.css")
    .expect(200)
    .expect(/font-face/)
    .expect("Content-Type", /css/)
    .end(function(err, res){
      test.error(err);
      test.end();
    });

});

tape("Font file", function(test) {

  request(server)
    .get("/fonts/custom-0.ttf")
    .expect(200)
    .expect("Content-Type", /ttf/)
    .end(function(err, res){
      test.error(err);
      test.end();
    });

});

tape("Server static background", function(test) {

  request(server)
    .get("/settings/backgrounds/nyc.png")
    .expect(200)
    .expect("Content-Type", /image/)
    .end(function(err, res){
      test.error(err);
      test.end();
    });

});

tape("Max size", function(test) {

  request(server)
    .post("/submit/")
    .attach("audio", longSample)
    .field("theme", "{}")
    .expect(500)
    .end(function(err, res){
      test.assert(res.text.match(/uploads are limited/i));
      test.end();
    });

});

tape("Missing file", function(test) {

  request(server)
    .post("/submit/")
    .type("json")
    .field("theme", "{}")
    .expect(500)
    .end(function(err, res){
      test.assert(res.text.match(/audio/i));
      test.end();
    });

});

tape("Broken settings", function(test) {

  request(server)
    .post("/submit/")
    .type("multipart/form-data")
    .field("theme", "a")
    .expect(500)
    .end(function(err, res){
      test.assert(res.text.match(/settings/i));
      test.end();
    });

});

tape("Successful submission", function(test) {

  var jobsFile = path.join(__dirname, "..", ".jobs");

  request(server)
    .post("/submit/")
    .attach("audio", shortSample)
    .field("theme", JSON.stringify({ test: true }))
    .expect(200)
    .end(function(err, res){

      var body = JSON.parse(res.text);

      test.assert("id" in body);

      queue(1)
        .defer(fs.readFile, path.join(serverSettings.workingDirectory, body.id, "audio"))
        .defer(fs.readFile, path.join(serverSettings.storagePath, "audio", body.id))
        .defer(checkStatus, body.id)
        .defer(checkJobsFile, body.id)
        .await(function(err){
          test.error(err);
          test.end();
        });

    });

  function checkStatus(id, cb) {

    request(server)
      .get("/status/" + id + "/")
      .expect(200)
      .end(function(err, res){
        test.equal(JSON.parse(res.text).status, "queued");
        cb(err);
      });

  }

  function checkJobsFile(id, cb) {

    fs.readFile(jobsFile, "utf8", function(err, raw){
      var jobs = JSON.parse(raw);
      test.equal(jobs.jobs.pop().id, id);
      fs.writeFile(jobsFile, JSON.stringify(jobs), cb);
    });

  }

});

// Cleanup
tape.onFinish(function(){
  require("rimraf")(path.join(__dirname, "tmp"), function(err){
    if (err) {
      throw err;
    }
  });
});
