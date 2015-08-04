module.exports = spawnPouchdbServer

var async = require('async')
var path = require('path')
var spawn = require('cross-spawn')

var assureConfigFile = require('./lib/assure-config-file')
var assureDatabaseDir = require('./lib/assure-database-dir')
var getDefaults = require('./lib/get-defaults')

function spawnPouchdbServer (options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  options = getDefaults(options)

  async.waterfall([
    assureDatabaseDir.bind(null, options),
    assureConfigFile.bind(null, options)
  ], function (error) {
    if (error) return callback(error)

    var pouchDbBinPath = path.resolve(__dirname, './node_modules/.bin/pouchdb-server')
    var pouchDbServerArgs = ['--config', options.config.file]
    if (options.backend === false) {
      pouchDbServerArgs.push('--in-memory')
    } else {
      if (options.backend.name) {
        pouchDbServerArgs.push('--level-backend', options.backend.name)
      }
      if (options.backend.location) {
        pouchDbServerArgs.push('--level-prefix', options.backend.location)
      }
    }

    console.log('starting pouchdb-server %s', pouchDbServerArgs.join(' '))
    var pouchDbServer = spawn(pouchDbBinPath, pouchDbServerArgs)
    pouchDbServer.backend = options.backend
    pouchDbServer.config = options.config

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
