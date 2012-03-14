module.exports = JSON.parse(
  require('fs').readFileSync(__dirname + '/../config/settings.json', 'UTF-8')
)[(process.env.NODE_ENV == 'production') ? 'production' : 'development'];