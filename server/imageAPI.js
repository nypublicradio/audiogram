var fs = require('fs'),
  path = require('path'),
  multer = require('multer');

var Storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './settings/backgrounds');
  },
  filename: function(req, file, callback) {
    callback(null, file.originalname);
  }
});

var upload = multer({
  storage: Storage,
  fileFilter: function(req, file, cb) {

    var filetypes = /jpeg|jpg|png|gif|tiff|webp/;
    var mimetype = filetypes.test(file.mimetype);
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb('Error: File upload only supports the following image filetypes: ' + filetypes + '.');
  }
}).array('img', 1);

var post = function(req, res){
  upload(req, res, function(err) {
    if(err)
      return res.status(500).send(err);
    else
        return res.status(200).send('');
  });
};

var get = function(req, res){
  fs.readdir(path.join(__dirname, '..', 'settings', 'backgrounds'), function(err, files){
    if(err)
      res.status(500).send('An error occured reading the background directory.');
    else{
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(files));
    }
  });
};

module.exports = {
  post: post,
  get: get
};
