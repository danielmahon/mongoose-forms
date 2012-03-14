
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , settings = require('../settings.js')
  , ObjectId = Schema.ObjectId;

var Site;
var siteSchema = new Schema();
  
siteSchema.add({
  name: String,
  slug: {type: String, default: 'slug'},
  domain: String
});

module.exports = Site = mongoose.model('Site', siteSchema);