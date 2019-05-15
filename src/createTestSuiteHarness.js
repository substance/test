import { EventEmitter } from 'substance'
import './monkeyPatchResultsAPI'

export default function createTestSuiteHarness (tape) {
  return new ExtendedHarness(tape.createHarness())
}

function nextTick (f) {
  window.setTimeout(f, 0)
}

class ExtendedHarness extends EventEmitter {
  constructor (testFunc) {
    super()

    this.testFunc = testFunc

    // leaving a backlink to this instance so that we could expose this
    // as the main harness...
    testFunc._extendedHarness = this
  }

  runTests (tests, opts) {
    if (this.job) {
      this.job.cancel()
    }
    this.job = new RunJob(this, tests, opts)
    this.job.run().then(() => {
      let job = this.job
      this.job = null
      this.emit('done', job)
    })
  }

  isRunning () {
    return Boolean(this.job)
  }

  cancel () {
    if (this.job) {
      this.job.cancel()
      this.job = null
    }
  }

  getTests () {
    return this._getResults().tests || []
  }

  _getResults () {
    return this.testFunc._results
  }

  _watch (results) {
    // TODO: do we really need this?
    // instead it would be more useful to have the output captured
    // and made available either as stream or as line-buffer
    let testId = 0
    results.on('_push', t => {
      let id = testId++
      t.once('prerun', () => {
        let row = {
          type: 'test',
          name: t.name,
          id: id
        }
        this.job.output.push(row)
      })
      t.on('test', subTest => {
        console.error('nested tests are not supported')
      })
      t.on('result', res => {
        res.test = id
        res.type = 'assert'
        this.job.output.push(res)
      })
      t.on('end', () => {
        this.job.output.push({ type: 'end', test: id })
      })
    })
  }
}

class RunJob {
  constructor (harness, tests, opts) {
    this.harness = harness
    this.tests = tests
    this.output = []

    this._cancelled = false
    this._opts = opts || {}
  }

  run () {
    const tests = this.tests
    const opts = this._opts
    let idx = 0
    return new Promise((resolve, reject) => {
      function next () {
        if (idx < tests.length && !this._cancelled) {
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
