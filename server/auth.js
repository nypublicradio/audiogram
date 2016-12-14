var auth = require("http-auth");

module.exports = function(authFile) {

  var basic = auth.basic({
      file:   authFile,
      realm:  "Audiogram Administration",
      msg401: "Error: Your account details could not be authenticated."
  });

  return function(req, res, next) {
    (auth.connect(basic))(req, res, next);
  }

}
