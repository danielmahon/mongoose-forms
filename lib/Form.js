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

    mapFromSchema[pathstring] = true;

    if(!(pathstring in options.fields)) {
      options.fields[pathstring] = {};
    }

    options.fields[pathstring].order = options.fields[pathstring].order || order;
    options.fields[pathstring].mapped = true;
    options.fields[pathstring].type = _.defaults(
      type,
      options.fields[pathstring].type || {}
    );

    if(!('value' in options.fields[pathstring])
          && 'defaultValue' in type 
          && !_.isFunction(type.defaultValue)) {

      options.fields[pathstring].value = type.defaultValue;
    }

    order++;
  });

  for(var field in options.fields) {
    if(!('order' in options.fields[field])) {
      options.fields[field].order = order;
      order++;
    }

    if(!('name' in options.fields[field])) {   
      options.fields[field].name = field;
    }

    if(!('label' in options.fields[field])) {
      options.fields[field].label = capitaliseFirstLetter(field); 
    }

    if(!('isValid' in options.fields[field])) {
      
      options.fields[field].isValid = function(field) {
        return function(value) {
        
          field.value = value;

          if('validate' in field) {
            try {
              var newValue = field.validate.call(form, field.value, check, sanitize);
              if(newValue !== undefined) {
                field.value = newValue;
              }

              if('error' in field) {
                delete field.error;
              }
              
              valid = true;
            } catch(err) {
              field.error = err.message;
              valid = false; 
            }
              
            return valid;
          }

          return true;
        }
      }(options.fields[field]);

    }
  }

  var sorted;

  function sortFields() {
    
    sorted = [];

    for(var field in options.fields) {
      sorted.push({
        key: field,
        field: options.fields[field]
      });
    }

    sorted.sort(function(a,b) {
      return a.field.order - b.field.order;
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
      
      sorted.forEach(function(v) {
        fn(v.field, v.key);
      });

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

      form.populate(obj);

      form.eachField(function(field) {
        
        if(field.name in obj) {
          field.value = obj[field.name];
        }

        if('validate' in field) {
          try {
            var newValue = field.validate.call(form, field.value, check, sanitize);
            if(newValue !== undefined) {
              field.value = newValue;
            }

            if('error' in field) {
              delete field.error;
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