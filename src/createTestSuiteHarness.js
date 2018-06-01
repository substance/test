import makeTestRestartable from './makeTestRestartable'

export default function createTestSuiteHarness (tape) {
  // monkey patch tape.Test
  makeTestRestartable(tape)

  let harness = Object.assign(tape.createHarness(), HarnessExtension)
  return harness
}

function nextTick (f) {
  window.setTimeout(f, 0)
}

const HarnessExtension = {
  getResults () {
    return this._results
  },
  runTests (tests, opts) {
    if (this.job) {
      this.job.cancel()
    }
    this.job = new RunJob(tests, opts)
    this.job.run().then(() => {
      this.job = null
    })
  },
  isRunning () {
    return Boolean(this.job)
  },
  cancel () {
    if (this.job) {
      this.job.cancel()
      this.job = null
    }
  },
  getTests () {
    return this.getResults().tests || []
  }
}

class RunJob {
  constructor (tests, opts) {
    this.tests = tests
    this._cancelled = false
    this._opts = opts || {}
  }

  run () {
    const self = this
    const tests = this.tests
    const opts = this._opts
    let idx = 0
    return new Promise((resolve, reject) => {
      function next () {
        if (idx < tests.length && !self._cancelled) {
          let t = tests[idx++]
          t.once('end', () => {
            if (!t._ok && opts.stopOnError) return
            nextTick(next)
          })
          t.run()
        } else {
          resolve()
        }
      }
      nextTick(next)
    })
  }

  cancel () {
    this._cancelled = true
  }
}
