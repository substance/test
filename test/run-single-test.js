let { test, getMountPoint } = require('../dist/test.cjs.js')

test('Foo', (t) => {
  t.ok(true, 'All good.')
  t.end()
})

test('Bar', (t) => {
  getMountPoint(t).append('Bar')
  t.end()
})
