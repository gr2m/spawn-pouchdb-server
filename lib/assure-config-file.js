module.exports = assureConfigFile

var fs = require('fs')
var merge = require('lodash.merge')
var mkdirp = require('mkdirp')
var path = require('path')

function assureConfigFile (options, callback) {
  try {
    var currentConfig = require(options.config.file)
    updateConfig(currentConfig, options.config, callback)
  } catch (error) {
    console.log('writing config file at %s', options.config.file)
    mkdirp(path.resolve(options.config.file, '..'), function (error) {
      if (error) return callback(error)

      updateConfig({}, options.config, function () {
        callback(null)
      })
    })
  }
}

function updateConfig (currentConfig, newConfig, callback) {
  var config = merge(currentConfig, newConfig)
  fs.writeFile(config.file, JSON.stringify(config, null, 4), callback)
}
