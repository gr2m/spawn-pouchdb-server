module.exports = prepareExample

function prepareExample (pouch) {
  process.send({
    type: 'pid',
    data: pouch.pid
  })
  process.send({
    type: 'config',
    data: pouch.config
  })
}
