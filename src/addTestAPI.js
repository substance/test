import tape from 'tape'
import isNil from 'substance/util/isNil'

const Test = tape.Test

export default function addTestAPI() {

  Test.prototype.nil =
  Test.prototype.isNil = function (value, msg, extra) {
    this._assert(isNil(value), {
      message : msg,
      operator : 'nil',
      expected : true,
      actual : value,
      extra : extra
    })
  }

  Test.prototype.notNil =
  Test.prototype.isNotNil = function (value, msg, extra) {
    this._assert(!isNil(value), {
      message : msg,
      operator : 'nil',
      expected : true,
      actual : value,
      extra : extra
    })
  }

}