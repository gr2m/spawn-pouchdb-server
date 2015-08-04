var prepare = require('../utils/prepare-example')
var start = require('../../index')

start({
  config: {
    file: false
  }
}, function (error, pouch) {
  if (error) process.exit(1)

  prepare(pouch)
  process.send({
    type: 'test',
    data: [
      // is, expect, message
      ['equals', typeof pouch.config.file, 'string', 'defaults config.file to temporary file']
    ]
  })

  process.exit(0)
})
