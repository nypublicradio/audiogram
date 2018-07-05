var fs = require('fs'),
  path = require('path');

var themesPath = path.join(__dirname, '..','settings','themes.json');

function getThemes(cb){
  fs.readFile(themesPath, 'utf8', function (err, data) {
    if (err){
      if(err.code == 'ENOENT'){
        cb('');
      }
    }
    else{
      cb(data);
    }
  });
}

function writeThemeFile(data, res){
  var file = JSON.stringify(data, null, '\t');
  fs.writeFile(themesPath, file, function(err){
    if(err)
      res.status(500).send('There was a problem saving "themes.json".');
    else
      res.status(200).send('');
  });
}

function addTheme(body, res){

  function save(data){
    var themeFile = JSON.parse(data);

    // add the new addition to the JSON and remove the name and themeName attributes
    themeFile[body.name] = body;
    delete themeFile[body.name].currentName;
    delete themeFile[body.name].name;

    writeThemeFile(themeFile, res);
  }

  getThemes(save);
}

function updateTheme(body, res){

  function save(data){
    var themeFile = JSON.parse(data);

    // remove the old theme options
    delete themeFile[body.currentName];

    // add the new addition to the JSON and remove the name and themeName attributes
    themeFile[body.name] = body;
    delete themeFile[body.name].currentName;
    delete themeFile[body.name].name;

    writeThemeFile(themeFile, res);
  }

  getThemes(save);
}

function deleteTheme(body, res){

  function save(data){
    var themeFile = JSON.parse(data);

    // remove the deleted theme options
    delete themeFile[body.name];

    writeThemeFile(themeFile, res);
  }

  getThemes(save);
}

module.exports = function(req, res){
  switch (req.body.type) {
    case 'ADD':
      addTheme(req.body.data, res);
      break;
    case 'UPDATE':
      updateTheme(req.body.data, res);
      break;
    case 'DELETE':
      deleteTheme(req.body.data, res);
  }
};
