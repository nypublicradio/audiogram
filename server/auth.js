var auth = require("http-auth");

module.exports = function(authFile){

  var basic = auth.basic({
      file:   authFile,
      realm:  "Audiogram Administration",
      msg401: "Error: Your account details could not be authenticated.",
      msg407: "Error: Your account details could not be authenticated.",
      skipUser: true
  });

  return auth.connect(basic);

};
