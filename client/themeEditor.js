var d3 = require('d3'),
  $ = require('jquery'),
  preview = require('./preview.js'),
  options = require('./themeOptions.js');

var editorIsActive = false;
var themesJson = {};

function updateTheme(options) {
  if(options !== undefined){
    if(options.backgroundImage !== '')
      getImage(options);
    preview.theme(options);
  }
  else{
    preview.theme(d3.select(this.options[this.selectedIndex]).datum());
  }
}

function getImage(theme) {
  if (theme.backgroundImage) {
    theme.backgroundImageFile = new Image();

    theme.backgroundImageFile.onload = function(){
      updateTheme(anonymousTheme());
    };

    theme.backgroundImageFile.src = '/settings/backgrounds/' + theme.backgroundImage;
  }
}

function error(msg) {
  if (msg.responseText) {
    msg = msg.responseText;
  }
  if (typeof msg !== 'string') {
    msg = JSON.stringify(msg);
  }
  if (!msg) {
    msg = 'Unknown error';
  }
  d3.select('#loading-message').text('Loading...');
  setClass('error', msg);
}

function setClass(cl, msg) {
  d3.select('body').attr('class', cl || null);
  d3.select('#error').text(msg || '');
}

function anonymousTheme(){
  var output = {};
  d3.selectAll('.options-attribute-input').each(function(d){
    if(d.type == 'number'){
      if(Number.isNaN(parseFloat(this.value)))
        output[d.name] = null;
      else
        output[d.name] = parseFloat(this.value);
    }
    else{
      output[d.name] = this.value;
    }
  });

  return output;
}

function postTheme(type, data, cb){
  var postData = {
    type: type,
    data: data
  };

  $.ajax({
    url: '/api/themes',
    type: 'POST',
    data: JSON.stringify(postData),
    contentType: 'application/json',
    cache: false,
    success: cb,
    error: error
  });
}

function saveChanges(){
  var activeTheme = preview.theme();
  var activeThemeName = d3.select('#input-theme').property('value');

  function makeTheme(){
    var file = {};

    file.name = activeTheme.name;
    file.currentName = activeThemeName;

    d3.selectAll('.options-attribute-input').each(function(d){
      if(!this.disabled){
        if(this.getAttribute('type') == 'number')
          file[d.name] = parseFloat(this.value);
        else
          file[d.name] = this.value;
      }
    });

    return file;
  }

  function reloadPage(){
    var url = window.location.origin + window.location.pathname + '?t=' + activeTheme.name;
    window.location = url;
  }

  var themeNames = [];
  d3.selectAll('#input-theme option').each(function(d){
    themeNames.push(d.name);
  });
  themeNames.splice(themeNames.length-1, 1);

  var postData = makeTheme();

  if(activeTheme.name == 'default' || activeTheme.name == '0' || activeTheme.name == ''){
    window.alert('Please give your theme a name.');
  }
  else if(themeNames.indexOf(activeTheme.name) != -1 && activeThemeName == 'default'){
    window.alert('That theme name already exists. Please choose a different name or select it to edit it.');
  }
  else if(themeNames.indexOf(activeThemeName) != -1){
    var msg = 'Are you sure you want to override the options for "';
    msg += activeThemeName + '"? This action is permanent and cannot be undone.';
    if(window.confirm(msg)){
      postTheme('UPDATE', postData, reloadPage);
    }
  }
  else{
    postTheme('ADD', postData, reloadPage);
  }
}

function deleteTheme(){
  var activeThemeName = d3.select('#input-theme').property('value');

  var msg = 'Are you sure you want to delete the theme "';
  msg += activeThemeName + '"? This action is permanent and cannot be undone.';

  if(window.confirm(msg)){
    var postData = {name: activeThemeName};
    postTheme('DELETE', postData, function(){
      var url = window.location.origin + window.location.pathname;
      window.location = url;
    });
  }
}

function refreshTheme(){
  var theme = $.extend({name: preview.theme().name}, themesJson.default, themesJson[preview.theme().name]);
  updateTheme(theme);
  populateThemeFields();
}

function loadBkgndImages(cb){
  $.ajax({
    url: '/api/images',
    type: 'GET',
    cache: false,
    success: function(data){
      $('#attribute-backgroundImage').html('');

      var bkgndImgSelect = d3.select('#attribute-backgroundImage');
      for(var img of data){
        bkgndImgSelect.append('option')
          .attr('value', img)
          .text(img);
      }

      if(cb !== undefined){
        cb();
      }

    },
    error: error
  });
}

function uploadImage(){
  // this = the file input calling the function
  var img = this.files[0];

  var confirmed = confirm('Are you sure you want to upload ' + img.name + '?');
  if(confirmed){
    var formData = new FormData();
    formData.append('img', img);

    setClass('loading');

    $.ajax({
      url: '/api/images',
      type: 'POST',
      data: formData,
      contentType: false,
      cache: false,
      processData: false,
      success: function(){
        var setImg = function(){
          var input = d3.select('#container-backgroundImage').select('.options-attribute-input');
          input.property('value', img.name).attr('data-value', img.name);

          updateTheme(anonymousTheme());

          setClass(null);
        };

        loadBkgndImages(setImg);
      },
      error: error
    });
  }
}

function camelToTitle(string){
  var conversion = string.replace( /([A-Z])/g, ' $1' );
  var title = conversion.charAt(0).toUpperCase() + conversion.slice(1);
  return title;
}

function queryParser(query){
    query = query.substring(1);
    let query_string = {};
    const vars = query.split('&');
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split('=');
        if (typeof query_string[pair[0]] === 'undefined') {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
        } else if (typeof query_string[pair[0]] === 'string') {
            const arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
            query_string[pair[0]] = arr;
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }

    if (Object.keys(query_string).includes(''))
        return {};
    else
        return query_string;
};


function isEditor(){
  return document.querySelector('#themeEditor') !== null;
}

function isActive(){
  return editorIsActive;
}

function initializeThemes(themes){
  for (var key in themes) {
    themesJson[key] = $.extend({}, themes[key]);
    if('foregroundColor' in themesJson[key]){
      themesJson[key].captionColor = themesJson[key].foregroundColor;
      themesJson[key].waveColor = themesJson[key].foregroundColor;
    }
  }
}

function initializePreview(){
  var container = $('#preview');
  var top = $(container).offset().top;
  $(window).scroll(function() {
    var y = $(this).scrollTop();
    if (y >= top){
      $(container).addClass('sticky');
    }
    else{
      $(container).removeClass('sticky');
    }
  });

  preview.redraw();
}

function toggleSection(d){
  var name;

  if(typeof(d) == 'object')
    name = d.name;
  else
    name = d;

  $('#section-options-'+ name).slideToggle(500);
  $('#section-toggle-' + name).toggleClass('toggled');
}

function initialize(){
  var container = d3.select('#options');

  // Add Option Sections
  var sections = container.selectAll('.section').data(options)
    .enter()
    .append('div')
    .attr('class', 'section');

  var headers = sections.append('div')
    .attr('class', 'section-header')
    .on('click', toggleSection);

  // Add Section Toggles
  headers.append('svg')
    .attr('id', function(d){return 'section-toggle-' + d.name;})
    .attr('class', 'section-toggle')
    .attr('viewBox', '0 0 24 24')
    .append('path')
    .attr('d', function(){
      var path = 'M12,13.7c-0.5,0-0.9-0.2-1.2-0.5L0.5,2.9c-0.7-0.7-0.7-1.8,0-2.4C0.8,0.2,1.3,0,1.7,0h20.6C23.3,0,' +
          '24,0.8,24,1.7c0,0.4-0.2,0.9-0.5,1.2L13.2,13.2C12.9,13.6,12.5,13.7,12,13.7z';
      return path;
    });

  // Add Section Titles
  headers.append('h4')
    .attr('class', 'section-title')
    .text(function(d){return d.name;});

  var attributesContainer = sections.append('div')
    .attr('class', 'section-options')
    .attr('id', function(d){return 'section-options-' + d.name;})
    .style('display', 'none');

  // Add Option Container
  var attributes = attributesContainer.selectAll('.options-attribute')
    .data(function(d){return d.options;})
    .enter()
    .append('div')
    .attr('class','options-attribute')
    .attr('id', function(d){return 'container-' + d.name;})
    .attr('data-type', function(d){return d.type;});

  // Add Enable Checkboxes
  attributes.append('input')
    .attr('id', function(d){return 'enable-' + d.name;})
    .attr('class', 'options-checkbox options-attribute-child')
    .attr('name', function(d){return 'enable-' + d.name;})
    .attr('value', 'true')
    .attr('type', 'checkbox')
    .property('checked', true)
    .on('click', function(d){
      var input = d3.select('#attribute-' + d.name);
      if(this.checked){
        input.property('disabled', false);
        input.property('value', input.attr('data-value'));
        input.attr('value', input.attr('data-value'));
        updateTheme(anonymousTheme());
      }
      else{
        input.property('value', themesJson.default[d.name]);
        input.attr('value', themesJson.default[d.name]);
        input.property('disabled', true);
        updateTheme(anonymousTheme());
      }
    });

  // Add Option Labels
  attributes.append('label')
    .attr('for', function(d){return 'attribute-' + d.name;})
    .attr('class', 'options-attribute-child')
    .text(function(d){return camelToTitle(d.name);});

  // Add Help Text Icons
  attributes.append('i')
    .attr('id', function(d){return 'help-' + d.name;})
    .attr('class', 'attribute-help options-attribute-child fa fa-question')
    .attr('title', function(d){return d.help;});

  // Add Inputs For Text Fields
  sections.selectAll('.options-attribute:not([data-type="select"])')
    .append('input')
    .attr('id', function(d){return 'attribute-' + d.name;})
    .attr('class', 'options-attribute-input options-attribute-child input-text')
    .attr('name', function(d){return d.name;})
    .attr('type', function(d){return d.type;})
    .on('input', function(){
      this.setAttribute('data-value', this.value);
      updateTheme(anonymousTheme());
    });

  // Add Inputs For Select Fields
  sections.selectAll('.options-attribute[data-type="select"]')
    .append('select')
    .attr('id', function(d){return 'attribute-' + d.name;})
    .attr('class', 'options-attribute-input options-attribute-child input-select')
    .attr('name', function(d){return d.name;})
    .attr('type', function(d){return d.type;})
    .on('input', function(){updateTheme(anonymousTheme());})
    .selectAll('options')
    .data(function(d){return d.options;})
    .enter()
    .append('option')
    .attr('value', function(d){return d;})
    .text(function(d){return camelToTitle(d);});

  // Add Section Notes
  attributesContainer.append('p')
    .attr('class', 'options-note note')
    .text(function(d){return d.note;});

  // Add "New..." option to theme select
  d3.select('#input-theme')
    .append('option')
    .data([themesJson.default])
    .attr('value', 'default')
    .text('New...');

  // Add clickHandler for Save Button
  d3.select('#saveChanges')
    .on('click', saveChanges);

  // Add clickHandler for Delete Button
  d3.select('#deleteTheme')
    .on('click', deleteTheme);

  // Add clickHandler for Refresh Button
  d3.select('#refreshTheme')
    .on('click', refreshTheme);

  // Background Images Populate and Add Uploader
  loadBkgndImages(populateThemeFields);
  var bkgndImgContainer = d3.select('#container-backgroundImage');
  bkgndImgContainer.append('label')
    .attr('for', 'imgUploader')
    .attr('id', 'imgUploader-label')
    .attr('class', 'button')
    .append('i')
    .attr('class', 'fa fa-upload');
  bkgndImgContainer.append('input')
    .attr('type', 'file')
    .attr('id', 'imgUploader')
    .attr('name', 'imgUploader')
    .on('change', uploadImage);

  toggleSection('Metadata');

  // Active url theme
  var selectedTheme = queryParser(window.location.search);
  if('t' in selectedTheme && selectedTheme.t in themesJson){
    d3.select('#input-theme')
      .property('value', selectedTheme.t)
      .dispatch('change');
  }

  populateThemeFields();

  initializePreview();
  window.addEventListener('resize', function(){
    preview.redraw();
  });

  d3.select('#toggle-more-instructions').on('click', function(){
    $('#more-instructions').slideToggle(500);
  })


  // Toggle the editor container to loaded
  editorIsActive = true;
}

function populateThemeFields(){
  var activeTheme = preview.theme();
  var themeJson = activeTheme.name !== undefined && activeTheme.name in themesJson ?
    themesJson[activeTheme.name] :
    themesJson.default;

  d3.selectAll('.options-attribute').each(function(d){
    var input = d3.select(this).select('.options-attribute-input');

    var activeValue = d.name in activeTheme ? activeTheme[d.name] : '';
    input.property('value', activeValue).attr('data-value', activeValue);

    if(d.name == 'name'){
      d3.select('#enable-'+d.name).property('checked', true);
      input.property('disabled', false);
    }
    else if(activeTheme.name == undefined || !(d.name in themeJson)){
      d3.select('#enable-'+d.name).property('checked', false);
      input.property('disabled', true);
    }
    else{
      d3.select('#enable-'+d.name).property('checked', true);
      input.property('disabled', false);
    }

  });
}

window.themesJson = themesJson;

module.exports = {
  isEditor,
  isActive,
  initialize,
  initializeThemes,
  populateThemeFields
};
