let tape = require('tape')
let Test = require('tape/lib/test')
tape.Test = Test

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

module.exports = tape