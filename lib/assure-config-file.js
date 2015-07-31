module.exports = assureConfigFile

var fs = require('fs')
var mkdirp = require('mkdirp')

function assureConfigFile (config, callback) {
  try {
    callback(null, require(config.configFilePath))
  } catch (error) {
    mkdirp(config.databaseDir, function (error) {
      if (error) return callback(error)

      var pouchdbConfig = {
        log: {
          file: config.logFile
        },
        admins: {}
      }

      if (config.adminUser) {
        pouchdbConfig.admins[config.adminUser] = config.adminPass
      }

      fs.writeFile(config.configFilePath, JSON.stringify(pouchdbConfig, null, 4), callback)
    })
  }
}
