(function(root) {

var _;

if (typeof exports !== 'undefined') {
  _    = require('underscore');
} else {
  _ = root._;
}

var assert = {};

assert.AssertionError = function (message) {
  var SAFARI_STACK_ELEM = /([^@]*)@(.*):(\d+)/;
  var CHROME_STACK_ELEM = /\s*at ([^(]*)[(](.*):(\d+):(\d+)[)]/;

  this.message = message;
  try { throw new Error(); } catch (trace) {
    var idx;
    var stackTrace = trace.stack.split('\n');
    // parse the stack trace: each line is a tuple (function, file, lineNumber)
    // Note: unfortunately this is interpreter specific
    // safari: "<function>@<file>:<lineNumber>"
    // chrome: "at <function>(<file>:<line>:<col>"

    var stack = [];
    for (idx = 0; idx < stackTrace.length; idx++) {
      var match = SAFARI_STACK_ELEM.exec(stackTrace[idx]);
      if (!match) match = CHROME_STACK_ELEM.exec(stackTrace[idx]);
      if (match) {
        var entry = {
          func: match[1],
          file: match[2],
          line: match[3],
          col: match[4] || 0
        };
        if (entry.func === "") entry.func = "<anonymous>";
        stack.push(entry);
      }
    }

    // leave out the first entries that are from this file
    var thisFile = stack[0].file;
    for (idx = 1; idx < stack.length; idx++) {
      if (stack[idx].file !== thisFile) break;
    }
    this.stack = stack.slice(idx);
  }
};

assert.AssertionError.prototype = new Error();
assert.AssertionError.prototype.constructor = assert.AssertionError;
assert.AssertionError.prototype.name = 'AssertionError';

assert.AssertionError.prototype.log = function() {
  console.log(this.message);
  _.each(this.stack, function(frame) {
    console.log(frame.file+":"+frame.line);
  });
};

assert.AssertionError.prototype.toString = function() {
  var errorPos = this.stack[0];
  return this.message + " at " + errorPos.file+":"+errorPos.line;
};

var _assert = function(assertion, msg, cb) {
  if (!assertion) {
    var exc = new assert.AssertionError(msg);
    if (cb) cb(msg);
    throw exc;
  }
};

assert.fail = function(msg, cb) {
  var exc = new assert.AssertionError(msg);
  if (cb) cb(msg);
  throw exc;
};

assert.exception = function(clazz, func, that) {

  if (arguments.length == 1) {
    func = clazz;
    clazz = undefined;
    that = undefined;
  } else if (arguments.length == 2) {
    if (!_.isFunction(arguments[1])) {
      that = func;
      func = clazz;
      clazz = undefined;
    }
  }

  var thrown = false;
  var typeOk = clazz ? false : true;

  var err;
  try {
    func.call(that);
  } catch (_err) {
    err = _err;
    thrown = true;
    if (clazz && err instanceof clazz) typeOk = true;
  }
  if (thrown && typeOk) return;
  if(thrown) {
    console.log(err.toString());
    assert.fail("Assertion failed. Caught exception of wrong type in "+func.toString());
  }
  assert.fail("Assertion failed. Expected an exception in "+func.toString());
};

assert.equal = function(expected, actual, cb) {
  var msg = "Assertion failed. Expected="+expected+", actual="+actual;
  _assert(expected === actual, msg, cb);
};

assert.isEqual = assert.equal;

assert.isTrue = function(stmt, cb) {
  assert.equal(true, stmt, cb);
};

assert.isFalse = function(stmt, cb) {
  assert.equal(false, stmt, cb);
};

assert.isNull = function(obj, cb) {
  assert.equal(null, obj, cb);
};

assert.notNull = function(obj, cb) {
  _assert(null !== obj, "Assertion failed. Actual value is null.", cb);
};

assert.isDefined = function(obj, cb) {
  _assert(undefined !== obj, "Assertion failed. Actual value is undefined.", cb);
};

assert.isUndefined = function(obj, cb) {
  assert.equal(undefined, obj, cb);
};

assert.isArrayEqual = function(expected, actual) {
  var msg = "Assertion failed. Expected="+JSON.stringify(expected)+", actual="+JSON.stringify(actual);
  if (expected === actual) return;

  // false when only one is null or undefined
  if ((!expected || !actual) ||
    (expected.length !== actual.length)) assert.fail(msg);

  for (var idx=0; idx < expected.length; idx++) {
    if (expected[idx] !== actual[idx]) assert.fail(msg);
  }
};

assert.isDeepEqual = function(expected, actual) {
  var msg = "Assertion failed. Expected="+JSON.stringify(expected)+", actual="+JSON.stringify(actual);
  if (_.isEqual(expected, actual)) return;
  else assert.fail(msg);
};

if (typeof exports !== 'undefined') {
  module.exports = assert;
} else {
  root.Substance.assert = assert;
}

})(this);
