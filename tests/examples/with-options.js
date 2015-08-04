var async = require('async')
var fs = require('fs')
var path = require('path')
var request = require('request').defaults({json: true})

var prepare = require('../utils/prepare-example')
var start = require('../../index')

start({
  port: 5986,
  directory: './.db2',
  backend: {
    name: 'jsondown',
    location: '.db2/'
  },
  log: {
    file: './.db2/foo.log',
    level: 'debug'
  },
  config: {
    file: './.db2/foo.json'
  }
}, function (error, pouch) {
  if (error) process.exit(1)

  prepare(pouch)
  process.send({
    type: 'test',
    data: [
      // is, expect, message
      ['equals', pouch.config.httpd.port, 5986, 'defaults config.port to 5986'],
      ['equals', pouch.config.couchdb.database_dir, path.resolve(__dirname, '../../.db2'), 'sets config.couchdb.database_dir from options'],
      ['equals', pouch.config.log.file, path.resolve(__dirname, '../../.db2/foo.log'), 'sets config.log.file from options'],
      ['equals', pouch.config.file, path.resolve(__dirname, '../../.db2/foo.json'), 'sets config.file from options']
    ]
  })

  async.auto({
    rootPath: function (callback) {
      request('http://localhost:5986', callback)
    },
    createDb: function (callback) {
      request.put('http://localhost:5986/test-db', callback)
    },
    dbFileExists: ['createDb', function (callback) {
      fs.exists(path.resolve(__dirname, '../../.db2/test-db'), callback.bind(null, null))
    }],
    logFileExists: [function (callback) {
      fs.exists(path.resolve(__dirname, '../../.db2/foo.log'), callback.bind(null, null))
    }],
    configFileExists: [function (callback) {
      fs.exists(path.resolve(__dirname, '../../.db2/foo.json'), callback.bind(null, null))
    }]
  }, function (error, results) {
    if (error) throw error

    process.send({
      type: 'test',
      data: [
        // is, expect, message
        ['ok', results.rootPath[1].version, 'responds with {version}'],
        ['ok', results.createDb[1].ok, 'creates test-db'],
        ['ok', results.dbFileExists, 'test-db file exists at .db2/test-db'],
        ['ok', results.logFileExists, 'log file exists at .db2/foo.log'],
        ['ok', results.configFileExists, 'config file exists at .db2/foo.json']
      ]
    })

    process.exit(0)
  })
})
