import tape from 'tape'
import makeTestRestartable from './makeTestRestartable'

export default function createTestSuiteHarness() {

  // monkey patch tape.Test
  makeTestRestartable()

  let harness = tape.createHarness()

  harness.getResults = function() {
    return this._results
  }
  harness.runTests = function(tests) {
    if (this.job) {
      this.job.cancel()
    }
    this.job = new RunJob(tests)
    this.job.run()
  }
  harness.cancel = function() {
    if (this.job) this.job.cancel()
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

function nextTick(f) {
  window.setTimeout(f, 0)
}

class RunJob {
  constructor(tests) {
    this.tests = tests
    this._cancelled = false
  }

  run() {
    const self = this
    const tests = this.tests
    let idx = 0
    function next() {
      if (idx < tests.length && !self._cancelled) {
        let t = tests[idx++]
        t.once('end', function() {
          nextTick(next)
        })
        t.run()
      }
    }
    nextTick(next)
  }

  cancel() {
    this._cancelled = true
  }
}
