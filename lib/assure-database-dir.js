module.exports = assureDatabaseDir

var mkdirp = require('mkdirp')

function assureDatabaseDir (options, callback) {
  if (options.backend === false) {
    return callback(null)
  }
  mkdirp(options.config.couchdb.database_dir, function () {
    callback(null)
  })
}
