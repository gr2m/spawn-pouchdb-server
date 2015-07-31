module.exports = cleanup

var exec = require('child_process').exec
var rimraf = require('rimraf')
var path = require('path')

function cleanup (t, pid, databaseDir) {
  if (databaseDir) {
    rimraf.sync(path.resolve(process.cwd(), databaseDir))
  }

  lookup(pid, function (error, pidFound) {
    if (error) throw error

    if (!pidFound) {
      return t.end()
    }

    kill(pid, function (error) {
      if (error) throw error

      t.notOk(pidFound, 'pouch process killed')
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
