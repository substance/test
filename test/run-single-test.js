let { test } = require('../dist/test.cjs.js')

test('Foo', function(t) {
  t.ok(true, 'All good.')
  t.end()
})
