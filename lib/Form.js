var _ = require("underscore");

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

    if('defaultValue' in type && !_.isFunction(type.defaultValue)) {
      options.fields[pathstring].value = type.defaultValue;
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
    eachField: function(fn) {
      
      if(!sorted) {
        sortFields();
      }

      sorted.forEach(fn);
    },
    getField: function(field) {
      if(field in options) {
        return options['field'];
      }
    },
    options: options
  };

  return form;
}

exports.Form = Form;