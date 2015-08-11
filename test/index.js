var test = require('tape')

var runExample = require('./utils/run-example')

test('examples/without-options', function (t) {
  runExample('without-options', t)
})
test('examples/jsondown', function (t) {
  runExample('jsondown', t)
})
test('examples/with-options', function (t) {
  runExample('with-options', t)
})
test('examples/without-config-file', function (t) {
  runExample('without-config-file', t)
})
test('examples/in-memory', function (t) {
  runExample('in-memory', t)
})
