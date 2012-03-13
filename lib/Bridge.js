
function Bridge(model, form) {

  var bridge = {
    setModel: function(_model) {
      model = _model;
    },
    setForm: function(_form) {
      form = _form;
    },
    getForm: function() {
      
      model.schema.eachPath(function(pathstring) {
        var field = form.getField(pathstring);

        if(field) {
          field.value = model[pathstring]; 
        }
      });

      return form;
    },
    getModel: function() {
      
      form.eachField(function(field) {
        if(field.name in model.schema) {
          model[field.name] = field.value;
        }
      });

      return model;
    }
  };

  return bridge;
}

exports.Bridge = Bridge;