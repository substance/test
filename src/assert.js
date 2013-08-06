"use strict";

var _ = require('underscore');
var errors = require('substance-util').errors;

var assert = {};

assert.AssertionError = errors.define("AssertionError", -1);

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

assert.isObjectEqual = assert.isDeepEqual;

module.exports = assert;
