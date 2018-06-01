import { isNil } from 'substance'

export default function addTestAPI (tape) {
  const Test = tape.Test

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
