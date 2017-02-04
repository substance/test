import tape from 'tape'

// monkey path tape so that we can restart the tests in the TestSuite
export default function makeTestRestartable() {

  const Test = tape.Test

  Test.prototype.reset = function() {
    this.readable = true
    this.assertCount = 0
    this.pendingCount = 0
    this._plan = undefined
    this._planError = null
    this._progeny = []
    this._ok = true
    this.calledEnd = false
    this.ended = false
    this.runtime = -1
  }

  const _run = Test.prototype.run

  Test.prototype.run = function() {
    let _ok = false
    try {
      this.reset()
      const start = Date.now()
      this.once('end', () => {
        this.runtime = Math.round(Date.now() - start)
      })
      _run.apply(this, arguments)
      _ok = true
    }
    // Using *finally* without *catch* enables us to use browser's
    // 'Stop on uncaught exceptions', but still making sure
    // that 'end' is emitted
    finally {
      if (!_ok) {
        this._ok = false
        this.emit('end')
      }
    }
  }

}
