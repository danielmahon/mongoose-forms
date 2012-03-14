var Handlebars  = require('handlebars'),
    mongoose    = require('mongoose'),
    Schema      = mongoose.Schema,
    _           = require('underscore'),
    select      = require('soupselect').select,
    htmlparser  = require('htmlparser'),
    should      = require('should');

var bindHelpers = require('../lib/bindHelpers.js').bindHelpers;
var Form        = require('../lib/Form.js').Form;

var BlogPost = new Schema({
    title   : String,
    date    : {type: Date}
});

BlogPost = mongoose.model('DifferentBlogPost', BlogPost);

var helpers = {};

var mockHandlebars = {
  registerHelper: function(name, callback) {  
    helpers[name] = callback;
  },
  compile: Handlebars.compile
}

module.exports = {
  'Standard helpers are bound': function() {
    
    helpers = {};

    bindHelpers(mockHandlebars);

    should.exist(helpers.renderField);
    should.exist(helpers.renderForm);
  },
  'Render a single field': function(beforeExit) {

    helpers = {};
        
    var form = Form(BlogPost);
    
    bindHelpers(mockHandlebars);
    
    var out = helpers.renderField(form.getField('title'));

    var handler = new htmlparser.DefaultHandler(function(err, dom) {
      
      var label = select(dom, 'label');
      label[0].children[0].data.should.equal('Title');
  
      var input = select(dom, 'input');
      input[0].attribs.type.should.equal('text');
      input[0].attribs.name.should.equal('title');
      input[0].attribs['class'].should.equal('');
    });

    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(out);
  },
  'Render a whole form, including outer element': function() {
    
    helpers = {};

    var form = Form(BlogPost, {
      renderOuter: true,
      fields: {
        date: {
          'class': 'date'
        }
      }
    });
    
    bindHelpers(mockHandlebars);
    
    var out = helpers.renderForm(form);

    var handler = new htmlparser.DefaultHandler(function(err, dom) {
      
      var formElements = select(dom, 'form');
      formElements.should.have.length(1);
      
      var labels = select(dom, 'label');
      labels.should.have.length(2);
      labels[0].children[0].data.should.equal('Title');
      labels[1].children[0].data.should.equal('Date');
      
      var inputs = select(dom, 'input');
      inputs[0].attribs.type.should.equal('text');
      inputs[0].attribs.name.should.equal('title');
      inputs[0].attribs['class'].should.equal('');

      inputs[1].attribs.type.should.equal('text');
      inputs[1].attribs.name.should.equal('date');
      inputs[1].attribs['class'].should.equal('date');
    });

    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(out);
  },
  'Other template styles override default': function() {
    
    helpers = {};

    var form = Form(BlogPost, {
      renderOuter: true,
      fields: {
        date: {
          'class': 'date'
        }
      }
    });
    
    bindHelpers(mockHandlebars, 'bootstrap');
    
    var out = helpers.renderForm(form);

    var handler = new htmlparser.DefaultHandler(function(err, dom) {
      
      var formElements = select(dom, 'form');
      formElements.should.have.length(1);
      
      var bootstrapControlGroups = select(dom, 'div.control-group');
      bootstrapControlGroups.should.have.length(2);
    });

    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(out);
  }
};