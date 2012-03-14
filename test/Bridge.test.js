
var should    = require('should'),
    mongoose  = require('mongoose'),
    Schema    = mongoose.Schema,
    _         = require('underscore'),
    Form      = require('../lib/Form.js').Form,
    Bridge    = require('../lib/Bridge.js').Bridge;

var BlogPost = new Schema({
    title   : String,
    views   : {type: Number, default: 5}, 
    date    : {type: Date, default: Date.now}
});

BlogPost = mongoose.model('BlogPost', BlogPost);

module.exports = {
  'Bridge takes a form and populates a model': function() {

    var form = Form(BlogPost, {
      fields: {
        foo: {
          value: 'bar'
        },
        title: {
          value: 'Title'
        },
        views: {
          value: 9
        },
        date: {
          value: new Date()
        }
      }
    });

    var bridge = Bridge(new BlogPost, form);

    var model = bridge.getModel();

    should.not.exist(model.foo);

    model.title.should.equal('Title');
    model.views.toString().should.equal('9');
    model.date.should.equal(form.getField('date').value);
  },
  'Bridge takes a model and populates a form': function() {

    var model = new BlogPost({
      title: 'Title',
      views: 20,
      date: new Date()
    });

    var bridge = Bridge(model, new Form(BlogPost));

    var form = bridge.getForm();
    
    form.getField('title').value.should.equal('Title'); 
    form.getField('views').value.toString().should.equal('20');
    form.getField('date').value.should.equal(model.date); 
  }
};