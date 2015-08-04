module.exports = runExample

var fork = require('child_process').fork
var cleanup = require('./cleanup')

function runExample (example, t) {
  var child = fork('./tests/examples/' + example)
  var pid
  var config

  child.on('error', function (error) {
    t.notOk(error)
  })
  child.on('message', function (message) {
    if (message.type === 'pid') {
      pid = message.data
      return
    }
    if (message.type === 'config') {
      config = message.data
      return
    }
    if (message.type !== 'test') {
      return t.notOk('Unexpected message type: ' + message.type)
    }
    message.data.forEach(function (args) {
      t[args[0]].apply(t, args.slice(1))
    })
  })
  child.on('exit', function (code) {
    t.is(code, 0, 'starts and stops without errors')
    t.is(typeof pid, 'number', 'pid received')

    cleanup(t, pid, config.couchdb.database_dir)
  })
}
