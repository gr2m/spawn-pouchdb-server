module.exports = cleanup

var exec = require('child_process').exec
var rimraf = require('rimraf')
var path = require('path')

function cleanup (t, pid, directory) {
  if (directory) {
    rimraf.sync(path.resolve(process.cwd(), directory))
  }

  lookup(pid, function (error, pidFound) {
    if (error || !pidFound) {
      return t.end()
    }

    kill(pid, function () {
      // ignore errors, as they occur randomly on travis tests
      t.end()
    })
  })
}

function lookup (pid, callback) {
  var command = 'ps a | grep ' + pid
  exec(command, function (error, result) {
    if (error) return callback(error)

    var pidFound = result.split(/\n/).length === 4
    callback(null, pidFound)
  })
}

function kill (pid, callback) {
  var command = 'kill ' + pid
  exec(command, function (error, result) {
    if (error) return callback(error)

    callback(null)
  })
}
