module.exports = getDefaults

var merge = require('lodash/merge')
var path = require('path')
var set = require('deep-property').set
var tmp = require('tmp')

function getDefaults (options) {
  if (!options) {
    options = {}
  }

  if (options.port) {
    set(options, 'config.httpd.port', options.port)
    delete options.port
  }

  if (options.directory) {
    set(options, 'config.couchdb.database_dir', options.directory)
    delete options.directory
  }

  if (options.log) {
    set(options, 'config.log.file', options.log.file)
    set(options, 'config.log.level', options.log.level)
    delete options.log
  }
  var defaults = {
    verbose: false,
    timeout: 10000,
    backend: {
      name: options.backend && options.backend.name, // defaults to pouchdb-server's leveldown
      location: options.backend && options.backend.location // defaults to config.directory
    },
    config: {
      file: '.db/config.json',
      couchdb: {
        database_dir: '.db'
      },
      httpd: {
        port: 5985
      },
      log: {
        file: '.db/pouch.log',
        level: 'info'
      }
    }
  }

  options = merge(defaults, options)

  if (options.config.log.level !== 'debug' && options.config.log.level !== 'info') {
    console.warn(
      'The loglevel was set to "info" instead of ' +
      options.config.log.level +
      ' so we can detect once PouchDB Server started.'
    )
    options.config.log.level = 'info'
  }

  if (options.config.file === false) {
    options.config.file = tmp.tmpNameSync()
  }
  if (options.config.log.file === false) {
    options.config.log.file = tmp.tmpNameSync()
  }

  options.config.file = path.resolve(process.cwd(), options.config.file)
  options.config.couchdb.database_dir = path.resolve(process.cwd(), options.config.couchdb.database_dir)
  options.config.log.file = path.resolve(process.cwd(), options.config.log.file)

  if (options.backend === false) {
    delete options.config.couchdb.database_dir
  }

  return options
}
