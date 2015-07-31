var path = require('path')

var start = require('../../index')

start(function (error, pouch) {
  if (error) process.exit(1)

  process.send({
    type: 'pid',
    data: pouch.pid
  })
  process.send({
    type: 'test',
    data: [
      // is, expect, message
      [pouch.config.port, 5985, 'defaults config.port to 5985'],
      [pouch.config.databaseDir, './.db', 'defaults config.databaseDir to "./.db"'],
      [pouch.config.logFile, './.db/pouch.log', 'defaults config.logFile to "./.db/pouch.log"'],
      [pouch.config.configFilePath, path.resolve(__dirname, '../../.db/config.json'), 'defaults config.configFilePath to "db/config.json"']
    ]
  })
  process.exit(0)
})
