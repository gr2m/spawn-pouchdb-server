var async = require('async')
var fs = require('fs')
var path = require('path')
var request = require('request').defaults({json: true})

var prepare = require('../utils/prepare-example')
var start = require('../../index')

start(function (error, pouch) {
  if (error) process.exit(1)

  prepare(pouch)
  process.send({
    type: 'test',
    data: [
      // is, expect, message
      ['equals', pouch.config.httpd.port, 5985, 'defaults config.httpd.port to 5985'],
      ['equals', pouch.config.couchdb.database_dir, path.resolve(__dirname, '../../.db'), 'config.couchdb.database_dir to "./.db"'],
      ['equals', pouch.config.log.file, path.resolve(__dirname, '../../.db/pouch.log'), 'defaults config.log.file to "./.db/pouch.log"'],
      ['equals', pouch.config.file, path.resolve(__dirname, '../../.db/config.json'), 'defaults config.file to "./.db/config.json"'],
      ['equals', pouch.backend.name, undefined, 'defaults backend.name to undefined'],
      ['equals', pouch.backend.location, undefined, 'defaults backend.location to undefined']
    ]
  })

  async.auto({
    rootPath: function (callback) {
      request('http://localhost:5985', callback)
    },
    createDb: function (callback) {
      request.put('http://localhost:5985/test-db', callback)
    },
    dbFileExists: ['createDb', function (callback) {
      fs.exists(path.resolve(__dirname, '../../.db/test-db'), callback.bind(null, null))
    }],
    logFileExists: [function (callback) {
      fs.exists(path.resolve(__dirname, '../../.db/pouch.log'), callback.bind(null, null))
    }],
    configFileExists: [function (callback) {
      fs.exists(path.resolve(__dirname, '../../.db/config.json'), callback.bind(null, null))
    }]
  }, function (error, results) {
    if (error) throw error

    process.send({
      type: 'test',
      data: [
        // is, expect, message
        ['ok', results.rootPath[1].version, 'responds with {version}'],
        ['ok', results.createDb[1].ok, 'creates test-db'],
        ['ok', results.dbFileExists, 'test-db file exists at .db/test-db'],
        ['ok', results.logFileExists, 'log file exists at .db/pouch.log'],
        ['ok', results.configFileExists, 'config file exists at .db/config.json']
      ]
    })

    process.exit(0)
  })
})
