var _          = require("underscore"),
    fs         = require('fs');

function bindHelpers(hbs, style) {

  if(!style) {
    style = 'default';
  }

  var templateMap = {
    String: 'Input',
    Date: 'Input',
    Number: 'Input'
  };

  var templates = {};
  var path = __dirname + '/../templates';

  function getTemplate(instance) {
    
    if(instance in templates) {
      return templates[instance];
    } else if(instance in templateMap && templateMap[instance] in templates) {
      return templates[templateMap[instance]]; 
    }

    return templates['String'];
  }

  function loadTemplates(path) {
    var files = fs.readdirSync(path);
    for(var file in files) {
      
      var match = files[file].match(/(^.+)\.hbs$/i);
      if (!match || match[1] in templates) continue;

      var contents = fs.readFileSync(path + '/' + files[file], 'utf8');
      templates[match[1]] = hbs.compile(contents);
    }
  }

  if(style !== 'default') {
    loadTemplates(path + '/' + style);
  }

  loadTemplates(path);
 
  function renderField(field) {
    
    var type = 'String';

    if('template' in field) {
      type = field.template;
    } else if('type' in field && 'instance' in field.type && field.type.instance) {
      type = field.type.instance;
    }

    var copy = _.extend({}, field);

    if('options' in copy && _.isArray(copy.options)) {
      for(var i in copy.options) { 
        if(copy.options[i].value == copy.value) {
          copy.options[i].selected = true; 
        }
      }
    }

    var t = getTemplate(type);

    if(t) {
      return t(copy);
    }

    return '';
  }

  hbs.registerHelper('renderField', renderField);

  hbs.registerHelper('renderForm', function(form) {
    
    var out = '';

    form.eachField(function(field) {
      
      out += renderField(field);

    });

    if(form.options.renderOuter) {
      
      var outer = getTemplate('Outer')({
        options: form.options,
        body: out
      });

      return outer;
    }

    return out;
  });

}

exports.bindHelpers = bindHelpers;