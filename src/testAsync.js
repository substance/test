import test from './test'

export default function testAsync (name, func) {
  test(name, async assert => {
    let success = false
    try {
      await func(assert)
      success = true
    } finally {
      if (!success) {
        assert.fail('Test failed with an uncaught exception.')
        assert.end()
      }
    }
  })
}
