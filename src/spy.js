import isFunction from 'lodash/isFunction'

export default function spy(self, name) {
  var f
  if (arguments.length === 0) {
    f = function() {}
  }
  else if (arguments.length === 1 && isFunction(arguments[0])) {
    f = arguments[0]
  }
  else {
    f = self[name]
  }
  function spyFunction() {
    var res = f.apply(self, arguments)
    spyFunction.callCount++
    spyFunction.args = arguments
    return res
  }
  spyFunction.callCount = 0
  spyFunction.args = null
  spyFunction.restore = function() {
    if (self) {
      self[name] = f
    }
  }
  spyFunction.reset = function() {
    spyFunction.callCount = 0
    spyFunction.args = null
  }
  if (self) {
    self[name] = spyFunction
  }
  return spyFunction
}
