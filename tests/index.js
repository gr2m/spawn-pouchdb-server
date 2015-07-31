var test = require('tape')
var fork = require('child_process').fork

var cleanup = require('./utils/cleanup')

test('default options', function (t) {
  var child = fork('./tests/examples/start-without-options')
  var pid

  child.on('error', function (error) {
    t.notOk(error)
  })
  child.on('message', function (message) {
    if (message.type === 'pid') {
      pid = message.data
      return
    }
    if (message.type !== 'test') {
      return t.notOk('Unexpected message type: ' + message.type)
    }
    message.data.forEach(function (args) {
      t.is.apply(t, args)
    })
  })
  child.on('exit', function (code) {
    t.is(code, 0, 'starts and stops without errors')
    t.is(typeof pid, 'number', 'pid received')

    cleanup(t, pid, './.db')
  })
})
