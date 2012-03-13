# Mongoose Forms

A form library for Mongoose ODM using Handlebars templates and node validator

## Installing

    $ npm install mongoose-forms

## Creating a Form from a Model - Simplest Usage

```javascript
var mongooseForms = require('mongoose-forms');
var Model         = require('../models/Model.js')

var form = mongooseForms.Form(Model);

```

## Creating a Form from a Model - Pass along options

```javascript
var forms   = require('mongoose-forms');
var Site    = require('../models/Site.js')

var form = forms.Form(Site, {
  renderOuter: true,          // render the form container
  class: 'form-horizontal',   // give the form a class
  legend: 'Site Name',        // render a legend (only if renderOuter: true)
  maps: ['name', 'slug'],     // map only to these members of model
  method: 'post',             // form method
  fields: {
    actions: {                // Custom fields that don't exist in your model
      template: 'Actions',    // provide a template name
      order: 100,             // order acts like a weight
      buttons: [              // Custom fields can take arbitrary data
        {
          type: 'submit',
          label: 'Submit Form',
          'class': 'btn-primary'
        }
      ]
    },
    name: { // We can define validation and return sanitized data (or return nothing)
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

```

## Rendering a form using Handlebars

## Save a Model from a Form