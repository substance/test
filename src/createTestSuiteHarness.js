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
  harness.getModuleNames = function() {
    // NOTE: tape does not have modules
    // Instead we put the module name into each test
    // Now we compute the set of all unique module names
    let moduleNames = {}
    harness.getTests().forEach((t) => {
      if (t.moduleName) {
        moduleNames[t.moduleName] = true
      }
    })
    moduleNames = Object.keys(moduleNames)
    moduleNames.sort()
    return moduleNames
  }

  return harness
}
