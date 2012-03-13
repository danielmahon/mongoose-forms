var handlebars = require('handlebars'),
    _          = require("underscore"),
    fs         = require('fs');

function capitaliseFirstLetter(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function Form(model, options) {

  options = options || {};

  if(!('fields' in options)) {
    options.fields = {};
  }

  var schema = model.schema;
  var order = 0;
  schema.eachPath(function(pathstring, type) {

    var obj = {
      type: type,
      order: order
    };

    if(pathstring in options.fields) {

      options.fields[pathstring].type = _.defaults(
        options.fields[pathstring].type || {} ,
        obj.type
      );

    } else {
      options.fields[pathstring] = obj
    }

    options.fields[pathstring].name = pathstring;

    if(!('label' in options.fields[pathstring])) {
      options.fields[pathstring].label = capitaliseFirstLetter(pathstring); 
    } 

    order++;
  });

  var sorted;

  function sortFields() {
    
    sorted = [];

    for(var field in options.fields) {
      sorted.push(options.fields[field]);
    }

    sorted.sort(function(a,b) {
      return a.order - b.order;
    });
  }

  var form = {
    render: function() {
      
      console.log(options);

    },
    eachField: function(fn) {
      
      if(!sorted) {
        sortFields();
      }

      sorted.forEach(fn);
    },
    options: options
  };

  return form;
}

function Bridge(model, form) {

  var bridge = {
    setForm: function(_form) {
      form = _form;
    },
    getForm: function() {
      
    },
    getModel: function() {
      
    }
  };

  return bridge;
}

function bindHelpers(hbs, style) {

  if(!style) {
    style = 'default';
  }

  var templateMap = {
    String: 'Input'
  };

  var templates = {};
  var path = __dirname + '/templates';

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
      templates[match[1]] = handlebars.compile(contents);
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
    } else if('instance' in field.type) {
      type = field.type.instance;
    }

    var t = getTemplate(type);

    if(t) {
      return t(field);
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

exports.Form = Form;
exports.Bridge = Bridge;
exports.bindHelpers = bindHelpers;