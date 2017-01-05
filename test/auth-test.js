var tape = require("tape"),
    path = require("path"),
    fs = require("fs"),
    queue = require("d3").queue,
    request = require("supertest");

// Force uncache settings between tests
require("./uncache.js")("../lib/settings/", "../server", "../settings/");

var serverSettings = require("../lib/settings/");

serverSettings.workingDirectory = path.join(__dirname, "tmp", "working");
serverSettings.storagePath = path.join(__dirname, "tmp", "storage");
serverSettings.authFile = path.join(__dirname, "auth/test.htpasswd");
serverSettings.maxUploadSize = 100000;
serverSettings.worker = true;

var server = require("../server");

var longSample = path.join(__dirname, "audio/glazed-donut.mp3");

tape("Can't GET without credentials", function(test) {

  request(server)
    .get("/index.html")
    .expect(401)
    .end(failedAuth(test));

});

tape("Can't GET with bad credentials", function(test) {

  request(server)
    .get("/index.html")
    .auth('setec', 'astronomy')
    .expect(401)
    .end(failedAuth(test));

});

tape("Can't POST with bad credentials", function(test) {

  request(server)
    .post("/submit/")
    .attach("audio", longSample)
    .field("theme", JSON.stringify({ test: true }))
    .auth("setec", "astronomy")
    .expect(401)
    .end(failedAuth(test));

});

tape("/videos/ is open", function(test) {

  request(server)
    .get("/videos/hi")
    .expect(404)
    .end(function(err, res){
      test.error(err);
      test.assert(res.text.trim() === "Cannot GET /videos/hi");
      test.assert(!res.user);
      test.end();
    });

});

tape("GET with good credentials", function(test) {

  request(server)
    .get("/index.html")
    .auth('audio', 'gram')
    .expect(200)
    .end(function(err, res){
      test.error(err);
      test.assert(res.text.match(/Audiogram/));
      test.assert(!res.user);
      test.end();
    });

});

tape("POST with good credentials", function(test) {

  request(server)
    .post("/submit/")
    .attach("audio", longSample)
    .field("theme", JSON.stringify({ test: true }))
    .auth("foo", "bar")
    .expect(500)
    .end(function(err, res){
      test.error(err);
      test.assert(res.text.match(/uploads are limited/i));
      test.assert(!res.user);
      test.end();
    });

});

// Cleanup
tape.onFinish(function(){
  require("rimraf")(path.join(__dirname, "tmp"), function(err){
    if (err) {
      throw err;
    }
  });
});

function failedAuth(test) {
  return function(err, res){
    test.error(err);
    test.assert(res.text === "Error: Your account details could not be authenticated.");
    test.assert(!res.user);
    test.end();
  }
}
