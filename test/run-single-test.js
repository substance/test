let { test } = require('../dist/test.cjs.js')

test('Foo', (t) => {
  t.ok(true, 'All good.')
  t.end()
})

test('Bar', (t) => {
  t.sandbox.append('Bar')
  t.end()
})
