import clone from 'substance/util/clone'
import forEach from 'substance/util/forEach'
import isNil from 'substance/util/isNil'
import inBrowser from 'substance/util/inBrowser'
import platform from 'substance/util/platform'
import substanceGlobals from 'substance/util/substanceGlobals'
import DefaultDOMElement from 'substance/dom/DefaultDOMElement'
import tape from 'tape'

const Test = tape.Test

const defaultExtensions = {
  UI: function() {
    var args = this.getTestArgs(arguments)
    if (!inBrowser) args.opts.skip = true
    if(inBrowser && !substanceGlobals.TEST_UI) args.opts.setupUI = true
    return _withBeforeAndAfter(this, args)
  },
  FF: function() {
    var args = this.getTestArgs(arguments)
    if (!inBrowser || !platform.isFF) args.opts.skip = true
    return this.UI(args.name, args.opts, args.cb)
  },
  WK: function() {
    var args = this.getTestArgs(arguments)
    if (!inBrowser || !platform.isWebKit) args.opts.skip = true
    return this.UI(args.name, args.opts, args.cb)
  },
}

let harness = tape

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

tape.setupTestSuite = function(tape) {
  // add a tape.Test.reset() that allows to re-run a test
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

  var _run = Test.prototype.run
  Test.prototype.run = function() {
    var _ok = false
    try {
      this.reset()
      var start = Date.now()
      this.once('end', function() {
        this.runtime = Math.round(Date.now() - start)
      }.bind(this))
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

  // Using a timeout feels better, as the UI gets updated while
  // it is running.
  // var nextTick = process.nextTick
  tape = tape.createHarness()
  var nextTick = function(f) { window.setTimeout(f, 0) }
  var results = tape._results

  tape.runTests = function(tests) {
    tests = tests.slice()
    function next() {
      if (tests.length > 0) {
        var t = tests.shift()
        t.once('end', function(){
          nextTick(next)
        })
        t.run()
      }
    }
    nextTick(next)
  }

  tape.getTests = function() {
    return results.tests || []
  }

  tape = _addExtensions(defaultExtensions, tape, true)

  return tape
}

/*
  Helpers
*/

// copied from tape/lib/test.js
function getTestArgs() {
  var name = '(anonymous)'
  var opts = {}
  var cb
  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i]
    var t = typeof arg
    if (t === 'string') {
      name = arg
    }
    else if (t === 'object') {
      opts = arg || opts
    }
    else if (t === 'function') {
      cb = arg
    }
  }
  return { name: name, opts: opts, cb: cb }
}

function _withBeforeAndAfter(tapeish, args) {
  var _before = args.opts.before
  var _after = args.opts.after
  var _setupUI = args.opts.setupUI
  return tapeish(args.name, args.opts, function (t) {
    if(_before) _before(t)
    if(_setupUI) _setupSandbox(t)
    args.cb(t)
    if(_setupUI) _teardownSandbox(t)
    if(_after) _after(t)
  })
}

harness = _addExtensions(defaultExtensions, harness, true)

function _addExtensions(extensions, tapeish, addModule) {

  if (addModule) {
    tapeish.module = function(moduleName) {
      return _addExtensions(extensions, function() {
        var args = getTestArgs.apply(null, arguments)
        var name = moduleName + ": " + args.name
        var t = tapeish(name, args.opts, args.cb)
        t.moduleName = moduleName
        return t
      }, false)
    }
  }

  tapeish.withOptions = function(opts) {
    return _addExtensions(extensions, function() {
      var args = getTestArgs.apply(null, arguments)
      args.opts = Object.assign({}, opts, args.opts)
      return _withBeforeAndAfter(tapeish, args)
    })
  }

  tapeish.withExtension = function(name, fn) {
    var exts = clone(extensions)
    exts[name] = fn
    // wrapping tapeish to create a new tapeish with new extensions
    return _addExtensions(exts, function() {
      return tapeish.apply(tapeish, arguments)
    }, true)
  }

  tapeish.getTestArgs = function(args) {
    return getTestArgs.apply(null, args)
  }

  forEach(extensions, function(fn, name) {
    tapeish[name] = function() {
      return fn.apply(tapeish, arguments)
    }
  })

  return tapeish
}

function _setupSandbox(t) {
  // TestSuite may have injected an element already
  if (t.sandbox) {
    t.sandbox.empty()
  } else {
    var fixtureElement = window.document.querySelector('#qunit-fixture')
    if (!fixtureElement) {
      fixtureElement = window.document.createElement('div')
      fixtureElement.id = "qunit-fixture"
      window.document.querySelector('body').appendChild(fixtureElement)
    }
    var sandboxEl = window.document.createElement('div')
    fixtureElement.appendChild(sandboxEl)
    t.sandbox = DefaultDOMElement.wrapNativeElement(sandboxEl)
    t.sandbox._shouldBeRemoved = true
  }
}

function _teardownSandbox(t) {
  var sandbox = t.sandbox
  if (sandbox && sandbox._shouldBeRemoved) {
    sandbox.remove()
  }
}

export default harness