
var mongooseForms = require('mongoose-forms')
    Site          = require('../models/Site.js');

exports.Form = function(options) {

  return mongooseForms.Form(Site, {
    renderOuter: true,
    class: 'form-horizontal',
    legend: 'Site Name',
    maps: ['name', 'slug'],
    method: 'post',
    fields: {
      actions: {
        template: 'Actions',
        order: 100,
        buttons: [
          {
            type: 'submit',
            label: 'Submit Form',
            'class': 'btn-primary'
          }
        ]
      },
      name: {
        validate: function(value, check, sanitize) {
          check(value, 'Must be at least 6 characters').len(6);
          check(value, "Can't be more than 15 characters").len(6, 15);
          return sanitize(value).xss().trim();
        }
      },
      slug: {
        validate: function(value, check, sanitize) {
          return sanitize(value).xss().trim();
        }
      }
    }
  });
}