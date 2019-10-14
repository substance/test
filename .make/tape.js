import { default as tape } from 'tape'
import { default as Test } from 'tape/lib/test'
import { default as Results } from 'tape/lib/results'
import through from 'through'
import resumer from 'resumer'

tape.Test = Test
tape.Results = Results
tape.through = through
tape.resumer = resumer

function _isNil (obj) {
  return o === null || o === undefined
}

Test.prototype.nil =
Test.prototype.isNil = function (value, msg, extra) {
  this._assert(_isNil(value), {
    message: msg,
    operator: 'nil',
    expected: true,
    actual: value,
    extra: extra
  })
}

Test.prototype.notNil =
Test.prototype.isNotNil = function (value, msg, extra) {
  this._assert(!_isNil(value), {
    message: msg,
    operator: 'nil',
    expected: true,
    actual: value,
    extra: extra
  })
}

export default tape
