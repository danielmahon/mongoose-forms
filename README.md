# Mongoose Forms

A form templating and validation library for Mongoose ODM using Handlebars templates and node validator

## Installing

    $ npm install mongoose-forms

## Usage:

### Create a Form from a Model - Simple

```javascript
var Form    = require('mongoose-forms').Form;
var Model   = require('./lib/models/Model.js')

var form    = Form(Model); // Form fields will be generated from schema
                           // with default values and type detection
```

### Render Using Handlebars

Register our helpers

```javascript
mongooseForms.bindHelpers(Handlebars, 'bootstrap'); // Using the bootstrap markup style
```

Call from inside template

```html
<div class="container">
    {{{renderForm formObject}}}
</div>
```

### Save Model from Form (showing Express POST route) 

```javascript
var Bridge = require('mongoose-forms').Bridge;

app.post('/site/create', function(req, res) {
  
  var form = SiteForm();

  if(!form.isValid(req.body)) { ... Rerender form, automatically showing errors ... }

  Bridge(new Site, form) // Bridge populates Model from Form
    .getModel()
    .save(function(err, site) { });
});
```

### Populate Form from Model (showing Express GET route)

```javascript
app.get('/site/:id', function(req, res) {

  Site.findById(req.params.id, function(err, site) {

    var form = Bridge(site, new SiteForm).getForm(); // bridge populates Form from Model
    
    res.render('update', { form: form });
  });
});
```

### Create a Form from a Model - Advanced

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
    actions: {                // define custom fields that may or may not exist in your model
      template: 'Actions',    // provide a template name
      order: 100,             // order acts like a weight
      buttons: [              // custom fields can take arbitrary data
        {
          type: 'submit',
          label: 'Submit Form',
          'class': 'btn-primary'
        }
      ]
    },
    name: { // We can define validation and return sanitized data (or return nothing to simply passthrough)
      validate: function(value, check, sanitize) {
        check(value, 'Must be at least 6 characters').len(6);
        check(value, "Can't be more than 15 characters").len(6, 15);
        return sanitize(value).xss().trim();
      }
    }
  }
});

```

### Simplify life with a builder (name it something like: forms/User.js)

```javascript
var forms = require('mongoose-forms');
var User  = require('../models/User.js');

module.exports = function() {
  return forms.Form(User, {
    method: 'post',
    action: '/user/create',
    maps: ['username', 'password'],
    fields: {
      password: {
        template: 'Password',
        validate: function(value, check) {
          check(value, 'Minimum 6 characters and maximum 10').len(6, 10);
        }
      },
      submit: {
        template: 'Submit'
      }
    }
  });
}
```

Then include it in your program, and do stuff with it!

```javascript
var Bridge      = require('mongoose-forms').Bridge;

var User        = require('./lib/models/User.js');
var UserForm    = require('./lib/forms/User.js');


User.find({ username: 'Foobar' }, function(err, user) {
  renderSomeTemplate({
    form: Bridge(user, new UserForm).getForm()
  });
});

```

## License

Copyright (c) 2012 Josh Hundley &lt;josh.hundley@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.