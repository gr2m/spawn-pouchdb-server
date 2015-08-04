var async = require('async')
var fs = require('fs')
var path = require('path')
var request = require('request').defaults({json: true})

var prepare = require('../utils/prepare-example')
var start = require('../../index')

start({
  backend: {
    name: 'jsondown'
  }
}, function (error, pouch) {
  if (error) {
    console.error(error)
    process.exit(1)
  }

  prepare(pouch)
  process.send({
    type: 'test',
    data: [
      // is, expect, message
      ['equals', pouch.config.httpd.port, 5985, 'defaults config.httpd.port to 5986'],
      ['equals', pouch.config.couchdb.database_dir, path.resolve(__dirname, '../../.db'), 'config.couchdb.database_dir to "./.db"'],
      ['equals', pouch.config.log.file, path.resolve(__dirname, '../../.db/pouch.log'), 'defaults config.log.file to "./.db/pouch.log"'],
      ['equals', pouch.config.file, path.resolve(__dirname, '../../.db/config.json'), 'defaults config.file to "./.db/config.json"'],
      ['equals', pouch.backend.name, 'jsondown', 'sets backend.name to "jsondown"'],
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
    dbFileIsJson: ['createDb', function (callback) {
      fs.readFile(path.resolve(__dirname, '../../.db/test-db'), function (error, data) {
        if (error) return callback(null, false)

        try {
          JSON.parse(data)
          callback(null, true)
        } catch (error) {
          console.error(error)
          callback(null, false)
        }
      })
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
        ['ok', results.dbFileIsJson, 'test-db file .db/test-db is JSON'],
        ['ok', results.logFileExists, 'log file exists at .db/pouch.log'],
        ['ok', results.configFileExists, 'config file exists at .db/config.json']
      ]
    })

    process.exit(0)
  })
})
