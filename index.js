module.exports = spawnPouchdbServer

var fs = require('fs')
var http = require('http')
var async = require('async')
var relative = require('require-relative')
var spawn = require('cross-spawn')
var tmp = require('tmp')
var cloneDeep = require('lodash/cloneDeep')

var assureConfigFile = require('./lib/assure-config-file')
var assureDatabaseDir = require('./lib/assure-database-dir')
var getDefaults = require('./lib/get-defaults')

function spawnPouchdbServer (opts, callback) {
  var options = cloneDeep(opts)
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

    if (options.verbose) console.log('starting pouchdb-server %s', pouchDbServerArgs.join(' '))

    var startlog = tmp.tmpNameSync()

    var pouchDbServer = spawn(pouchDbBinPath, pouchDbServerArgs, {
      stdio: ['ignore', fs.openSync(startlog, 'w+'), process.stderr]
    })

    var timeout = setTimeout(function () {
      callback(new Error('Timeout: PouchDB did not start after ' + options.timeout + 'ms.'))
    }, options.timeout)

    var testForServerUp = setInterval(pingServer, 100)
    var serverUp

    function pingServer () {
      var port = options.config.httpd.port
      var req = http.get('http://localhost:' + port, function () {
        if (options.verbose) {
          console.log('pouchdb-server up')
        }
        if (!serverUp) {
          callback(null, pouchDbServer)
        }

        serverUp = true
        clearTimeout(timeout)
        clearInterval(testForServerUp)
      })
      req.on('error', function (err) { if (err) { return } })
    }

    pouchDbServer.backend = options.backend
    pouchDbServer.config = options.config

    var killMainProcessOnExit = true

    pouchDbServer.stop = function (callback) {
      killMainProcessOnExit = false
      pouchDbServer.on('exit', callback)
      pouchDbServer.kill()
    }

    // Stop main process when PouchDB Server dies.
    pouchDbServer.on('exit', function (code) {
      if (killMainProcessOnExit) process.exit(code)
    })

    // Kill PouchDB server when main process dies
    process.on('exit', function (code) {
      pouchDbServer.kill()
    })
  })
}
