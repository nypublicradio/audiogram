module.exports = function(){
  var resolved;
  for (var i = 0; i < arguments.length; i++) {
    resolved = require.resolve(arguments[i]);
    if (resolved in require.cache) {
      delete require.cache[resolved];
    }
  }
};
