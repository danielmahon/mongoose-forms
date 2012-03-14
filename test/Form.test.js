
var should    = require('should'),
    mongoose  = require('mongoose'),
    Schema    = mongoose.Schema,
    _         = require('underscore'),
    Form      = require('../lib/Form.js').Form;

var BlogPost = new Schema({
    title   : String,
    views   : {type: Number, default: 5}, 
    date    : {type: Date, default: Date.now}
});

BlogPost = mongoose.model('BlogPost', BlogPost);

module.exports = {  
  'Form adds fields based on schema': function(beforeExit, assert) {
    
    var form = Form(BlogPost);

    form.options.fields.should.have.property('title');
    form.options.fields.should.have.property('views');
    form.options.fields.should.have.property('date');
  },
  'Form sets default values': function(beforeExit, assert) {
    
    var form = Form(BlogPost);

    form.options.fields.views.value.toString().should.equal('5')

    should.not.exist(form.options.fields.title.value);
    should.not.exist(form.options.fields.date.value); // if callback default, don't assign
  },
  'Form options can specify mapping': function() {
    
    var form = Form(BlogPost, {
      maps: ['views']
    });

    _.keys(form.options.fields).length.should.equal(1);
  },
  'Form options can specify custom fields': function() {
    
    var form = Form(BlogPost, {
      maps: ['views'],
      fields: {
        myfield: {
          template: 'Submit'
        }
      }
    });

    form.options.fields.should.have.property('myfield'); 
    form.options.fields.should.have.property('views'); 
  },
  'Form can iterate over mapped fields': function() {
    
    var form = Form(BlogPost, {
      maps: ['views', 'date'],
      fields: {
        myfield: {
          template: 'Submit'
        }
      }
    });

    var i = 0;
    form.eachMappedField(function(field) {
      i++;
    });

    i.should.equal(2);
  },
  'Form can iterate over all fields, in order': function() {
   
    var iterated = [];
    
    var form = Form(BlogPost, {
      maps: ['views', 'title'],
      fields: {
        myfield: {
          template: 'Submit',
          order: 50
        },
        title:  {
          order: 0
        },
        views: {
          order: 5
        }
      }
    });

    form.eachField(function(field, v) {
      iterated.push(field.name);
    });

    iterated[0].should.equal('title');
    iterated[1].should.equal('views');
    iterated[2].should.equal('myfield');
  },
  'Form can return model used': function() {
    
    var form = Form(BlogPost);

    form.getModel().should.equal(BlogPost);
  },
  'Form can return a given field': function() {
    
    var form = Form(BlogPost, {
      fields: {
        myfield: {}
      }
    });

    form.getField('title').should.equal(form.options.fields.title);
    form.getField('myfield').should.equal(form.options.fields.myfield);
    should.not.exist(form.getField('foobar'));
  },
  'Form can be populated from a hash': function() {
    var form = Form(BlogPost, {
      fields: {
        myfield: {}
      }
    });

    var date = new Date();

    form.populate({
      views: 10,
      date: date,
      myfield: 'something'
    });

    form.getField('views').value.should.equal(10);
    form.getField('date').value.should.equal(date);
    form.getField('myfield').value.should.equal('something');
    should.not.exist(form.getField('title').value);
  },
  'Form can validate and sanitize': function() {

    var form = Form(BlogPost, {
      fields: {
        title: {
          validate: function(value, validate, sanitize) {
            validate(value, 'Must be minimum 5').len(5);
            return 'valid and sanitized';
          }
        }
      }
    });

    var valid = form.isValid({
      title: 'nope'
    });

    valid.should.be.false;

    should.exist(form.getField('title').error);
    form.getField('title').value.should.equal('nope');
    form.getField('title').error.should.equal('Must be minimum 5');

    var valid = form.isValid({
      title: 'longer and should pass'
    });

    valid.should.be.true;

    should.not.exist(form.getField('title').error);
    form.getField('title').value.should.equal('valid and sanitized');
  }
};