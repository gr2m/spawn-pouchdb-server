var merge = require('lodash.merge')
var parseConfig = require('12factor-config')

/**
 * parses [12config](https://www.npmjs.com/package/12factor-config)-compatible configuration
 *
 * @param  {Object}  defaults   optional default properties to overwrite config defaults
 */
function getConfig (defaults) {
  var config = parseConfig({
    port: {
      env: 'POUCHDB_SERVER_PORT',
      type: 'integer',
      default: 5985
    },
    databaseDir: {
      env: 'POUCHDB_SERVER_DATABASE_DIR',
      type: 'string',
      default: './.db'
    },
    logFile: {
      env: 'POUCHDB_SERVER_LOG_FILE',
      type: 'string',
      default: './.db/pouch.log'
    },
    adminUser: {
      env: 'POUCHDB_SERVER_ADMIN_USER',
      type: 'string'
    },
    adminPass: {
      env: 'POUCHDB_SERVER_ADMIN_PASS',
      type: 'string'
    }
  })

  if (config.databaseDir !== './.db') {
    config.logFile = config.logFile.replace(/.\/.db/, config.databaseDir)
  }

  return merge(config, defaults)
}

module.exports = getConfig()
