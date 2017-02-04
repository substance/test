import tape from 'tape'
import makeTestRestartable from './makeTestRestartable'

export default function createTestSuiteHarness() {

  // monkey patch tape.Test
  makeTestRestartable()

  // Then create a new harness for the TestSuite
  // Using a timeout feels better, as the UI gets updated while
  // it is running.
  // var nextTick = process.nextTick
  let harness = tape.createHarness()
  function nextTick(f) { window.setTimeout(f, 0) }
  harness.getResults = function() {
    return this._results
  }
  harness.runTests = function(tests) {
    tests = tests.slice()
    function next() {
      if (tests.length > 0) {
        var t = tests.shift()
        t.once('end', function(){
          nextTick(next)
        })
        t.run()
      }
    }
    nextTick(next)
  }
  harness.getTests = function() {
    return this.getResults().tests || []
  }

  return harness
}
