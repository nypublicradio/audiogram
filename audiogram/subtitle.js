var subtitle = require("subtitle"),
		fs = require("fs");

module.exports = function(file, cb) {
	if (!fs.existsSync(file)) {
		return cb(null, null);
	}

	fs.readFile(file, "utf8", (err, data) => {
  	if (err) {
  		return cb(err, data);
  	}
  	
  	const srt = subtitle.parse(data);
  	return cb(null, srt);
	});
}