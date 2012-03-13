var _         = require("underscore"),
    check     = require('validator').check,
    sanitize  = require('validator').sanitize;

function capitaliseFirstLetter(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function Form(model, options) {

  options = options || {};

  if(!('fields' in options)) {
    options.fields = {};
  }

  if('maps' in options && _.isArray(options.maps)) {
    var map = {};
    _.each(options.maps, function(val) {
      map[val] = true;
    });
    options.maps = map;
  }

  var schema = model.schema;
  var order = 0;
  var mapFromSchema = {};

  schema.eachPath(function(pathstring, type) {

    if('maps' in options && !(pathstring in options.maps)) {
      return;
    }

    var obj = {
      type: type,
      order: order
    };

    if(pathstring in options.fields) {

      options.fields[pathstring].type = _.defaults(
        options.fields[pathstring].type || {} ,
        obj.type
      );

      _.extend(obj, options.fields[pathstring]);
    }

    options.fields[pathstring] = obj;

    if('defaultValue' in type && !_.isFunction(type.defaultValue)) {
      options.fields[pathstring].value = type.defaultValue;
    }

    options.fields[pathstring].name = pathstring;

    mapFromSchema[pathstring] = true;

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

  if(!('maps' in options)) {
    options.maps = mapFromSchema;
  }

  var form = {
    getModel: function() {
      return model;
    },
    eachField: function(fn) {
      
      if(!sorted) {
        sortFields();
      }

      sorted.forEach(fn);

      return form;
    },
    eachMappedField: function(fn) {
      
      for(var i in options.maps) {
        fn(options.fields[ i ], i);
      }

      return form;
    },
    getField: function(field) {
      if(field in options.fields) {
        return options.fields[field];
      }
    },
    populate: function(obj) {
      
      _.each(obj, function(v, k) {
        if(k in options.fields) {
          options.fields[k].value = v; 
        }
      });

      return form;
    },
    isValid: function(obj) {
      
      var valid = true;

      form.eachField(function(field) {
        
        if(field.name in obj) {
          field.value = obj[field.name];
        }

        if('validate' in field) {
          try {
            var newValue = field.call(field, field.value, check, sanitize);
            if(newValue !== undefined) {
              field.value = newValue;
            }
          } catch(err) {
            
            field.error = err.message;
            valid = false;
          }
        }

      });

      return valid;
    },
    options: options
  };

  return form;
}

exports.Form = Form;