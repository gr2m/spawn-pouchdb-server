module.exports = spawnPouchdbServer

var path = require('path')
var spawn = require('cross-spawn')
var merge = require('lodash.merge')

var assureConfigFile = require('./lib/assure-config-file')
var defaults = require('./lib/defaults')

function spawnPouchdbServer (options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  var config = merge({}, options, defaults)
  var port = config.port
  var dataPath = config.databaseDir

  config.configFilePath = path.resolve(dataPath, 'config.json')

  assureConfigFile(config, function (error) {
    if (error) return callback(error)

    var pouchDbBinPath = path.resolve(__dirname, './node_modules/.bin/pouchdb-server')
    var pouchDbServer = spawn(pouchDbBinPath, ['-p', port, '-d', dataPath, '-c', config.configFilePath])

    pouchDbServer.config = config

    // Stop main process when PouchDB Server dies.
    pouchDbServer.on('exit', function (code) {
      process.exit(code)
    })

    // Kill PouchDB server when main process dies
    process.on('exit', function (code) {
      pouchDbServer.kill()
    })

    pouchDbServer.stdout.on('data', function (data) {
      if (/navigate to .* for the Fauxton UI/.test(data)) {
        callback(null, pouchDbServer)
      }
    })
  })
}
