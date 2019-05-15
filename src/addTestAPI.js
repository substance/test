import { isNil, platform } from 'substance'

export default function addTestAPI (Test) {
  if (platform.inNodeJS) {
    const _run = Test.prototype.run
    Test.prototype.run = function () {
      try {
        _run.apply(this, arguments)
      } catch (err) {
        this.fail('Uncaught error: ' + String(err))
        this.end()
      }
    }
  }

  Test.prototype.nil =
  Test.prototype.isNil = function (value, msg, extra) {
    this._assert(isNil(value), {
      message: msg,
      operator: 'nil',
      expected: true,
      actual: value,
      extra: extra
    })
  }

  Test.prototype.notNil =
  Test.prototype.isNotNil = function (value, msg, extra) {
    this._assert(!isNil(value), {
      message: msg,
      operator: 'nil',
      expected: true,
      actual: value,
      extra: extra
    })
  }
}
