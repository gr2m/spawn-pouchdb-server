module.exports = spawnPouchdbServer

var fs = require('fs')

var async = require('async')
var relative = require('require-relative')
var spawn = require('cross-spawn')
var tmp = require('tmp')

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

    var relativePouchDbBinPath = 'pouchdb-server/bin/pouchdb-server'
    var pouchDbBinPath
    try {
      pouchDbBinPath = relative.resolve(relativePouchDbBinPath, process.cwd())
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        pouchDbBinPath = require.resolve(relativePouchDbBinPath)
      } else {
        return callback(error)
      }
    }

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

    var startlog = tmp.tmpNameSync()

    var pouchDbServer = spawn(pouchDbBinPath, pouchDbServerArgs, {
      stdio: ['ignore', fs.openSync(startlog, 'w+'), process.stderr]
    })

    fs.watchFile(startlog, {
      interval: 100
    }, function watch () {
      var log = fs.readFileSync(startlog, {
        encoding: 'utf8'
      })

      if (/navigate to .* for the Fauxton UI/.test(log)) {
        callback(null, pouchDbServer)
        fs.unwatchFile(startlog, watch)
      }
    })

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
  })
}
