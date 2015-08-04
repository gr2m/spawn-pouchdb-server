var async = require('async')
var fs = require('fs')
var path = require('path')
var request = require('request').defaults({json: true})

var prepare = require('../utils/prepare-example')
var start = require('../../index')
var defaults = require('../../lib/get-defaults')()

var rootUrl = 'http://localhost:' + defaults.config.httpd.port
var testDbName = 'test-db'
var testDbUrl = 'http://localhost:' + defaults.config.httpd.port + '/' + testDbName

start({
  backend: false,
  config: {
    file: false,
    log: {
      file: false
    }
  }
}, function (error, pouch) {
  if (error) process.exit(1)

  prepare(pouch)
  process.send({
    type: 'test',
    data: [
      // is, expect, message
      ['equals', typeof pouch.config.file, 'string', 'defaults config.file to temporary file']
    ]
  })

  async.auto({
    rootPath: function (callback) {
      request(rootUrl, callback)
    },
    createDb: function (callback) {
      request.put(testDbUrl, callback)
    },
    dbFileExists: ['createDb', function (callback) {
      fs.exists(path.resolve(defaults.config.couchdb.database_dir, testDbName), callback.bind(null, null))
    }],
    logFileExists: [function (callback) {
      fs.exists(defaults.config.log.file, callback.bind(null, null))
    }],
    configFileExists: [function (callback) {
      fs.exists(defaults.config.file, callback.bind(null, null))
    }]
  }, function (error, results) {
    if (error) throw error

    process.send({
      type: 'test',
      data: [
        // is, expect, message
        ['ok', results.rootPath[1].version, 'responds with {version}'],
        ['ok', results.createDb[1].ok, 'creates test-db'],
        ['notOk', results.dbFileExists, 'test-db file is not persisted'],
        ['notOk', results.logFileExists, 'log file is not persisted'],
        ['notOk', results.configFileExists, 'config file is not persisted']
      ]
    })

    process.exit(0)
  })
})
