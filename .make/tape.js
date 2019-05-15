const tape = require('tape')
const Test = require('tape/lib/test')
const Results = require('tape/lib/results')
const through = require('through')
const resumer = require('resumer')
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

module.exports = tape