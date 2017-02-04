import { test } from 'substance-test'

test('Foo', (t) => {
  t.ok(true, 'All good.')
  t.end()
})

test('Bar', (t) => {
  t.sandbox.append('Bar')
  t.end()
})
