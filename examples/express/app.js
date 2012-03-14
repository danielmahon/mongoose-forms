var _                 = require('underscore'),
    express           = require('express'),
    hbs               = require('hbs'),
    mongoose          = require('mongoose'),
    mongooseForms     = require('mongoose-forms');

var settings = require('./lib/settings');

mongoose.connect(settings.app.db);

var Site      = require('./lib/models/Site.js');
var SiteForm  = require('./lib/forms/Site.js').Form;
var Bridge    = mongooseForms.Bridge;

mongooseForms.bindHelpers(hbs, 'bootstrap');

var app = module.exports = express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set("view options", { layout: true });
  app.set('view engine', 'hbs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

function view(req, obj) {

  _.defaults(obj, {
    cache: true,
    compile: true,
    locals: { }
  });
    
  return obj;
}

app.get('/', function(req, res) {
  res.redirect('/site');
});

app.get('/site', function(req, res) {

  Site.find({}, function(err, sites) {
    res.render(
      'site/index', 
      view(req, {
        locals: {
          sites: sites
        }
      })
    );
  });

});

app.post('/site/create', function(req, res) {
  
  var form = SiteForm();

  var valid = form.isValid(req.body);

  if(!valid) {
    return res.render(
    'site/create', 
      view(req, {
        locals: {
          form: form
        }
      })
    );
  }

  Bridge(new Site, form)
    .getModel()
    .save(function(err, site) {
      res.redirect('/site');
    });
});

app.get('/site/create', function(req, res) {
  
  var form = SiteForm();

  form.options.legend = 'Create New';

  res.render(
    'site/create', 
    view(req, {
      locals: {
        form: form
      }
    })
  );
});

app.get('/site/:id', function(req, res) {
  
  Site.findById(req.params.id, function(err, site) {

    var form = Bridge(site, new SiteForm).getForm();
    
    form.options.legend = site.name;

    res.render(
      'site/view',
      view(req, {
        locals: {
          form: form
        }
      })
    );
  });

});

app.post('/site/:id', function(req, res) {
  
  Site.findById(req.params.id, function(err, site) {

    var form = SiteForm().populate(req.body);
    
    Bridge(site, form)
      .getModel()
      .save(function(err, site) {
        form.options.legend = site.name;
        res.render(
          'site/view',
          view(req, {
            locals: {
              form: form
            }
          })
        );
      });
  });
});


var port = process.argv[2] || 3000;

app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);