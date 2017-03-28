import tape from 'tape'
import platform from 'substance/util/platform'
import getTestArgs from './getTestArgs'
import DefaultDOMElement from 'substance/dom/DefaultDOMElement'

/*
  This TestFunction makes tape a bit better extensible.

  @example

  ```
  import { TestFunction } from 'substance-test'

  TestFunction.prototype.FF = function(...args) {
    let { name, opts, cb } = getTestArgs(args)
    if (!platform.inBrowser || !platform.isFF) opts.skip = true
    return this._runTape(name, opts, cb)
  }
*/
class TestFunction extends Function {

  constructor(moduleName = '', _opts = {}, harness = tape) {
    super()

    const before = _opts.before
    const after = _opts.after

    function registerTest(name, opts, cb) {
      let t = harness(getTestName(moduleName, name), Object.assign({}, _opts, opts), (t) => {
        _setupSandbox(t)
        if (before) before(t)
        cb(t)
        if (after) after(t)
        _teardownSandbox(t)
      })
      t.moduleName = moduleName
      return t
    }

    function testFunction(...args) {
      let { name, opts, cb } = getTestArgs(args)
      return registerTest(name, opts, cb)
    }
    testFunction.test = registerTest

    Object.setPrototypeOf(testFunction, TestFunction.prototype)

    return testFunction
  }

  UI(...args) {
    let { name, opts, cb } = this.getTestArgs(args)
    if (!platform.inBrowser) opts.skip = true
    return this.test(name, opts, cb)
  }

  FF(...args) {
    let { name, opts, cb } = this.getTestArgs(args)
    if (!platform.inBrowser || !platform.isFF) opts.skip = true
    return this.test(name, opts, cb)
  }

  WK(...args) {
    let { name, opts, cb } = this.getTestArgs(args)
    if (!platform.inBrowser || !platform.isWebKit) opts.skip = true
    return this.test(name, opts, cb)
  }

  getTestArgs(args) {
    return getTestArgs(args)
  }

  skip(...args) {
    let { name, opts, cb } = this.getTestArgs(args)
    opts.skip = true
    return this.test(name, opts, cb)
  }

}

function getTestName(moduleName, name) {
  if (moduleName) return moduleName + ': ' + name
  else return name
}

function _setupSandbox(t) {
  if (t.sandbox) {
    t.sandbox.empty()
  } else {
    // HACK: this is karma/qunit specific
    if (platform.inBrowser) {
      let fixtureElement = window.document.querySelector('#qunit-fixture')
      if (!fixtureElement) {
        fixtureElement = window.document.createElement('div')
        fixtureElement.id = "qunit-fixture"
        window.document.querySelector('body').appendChild(fixtureElement)
      }
      let sandboxEl = window.document.createElement('div')
      fixtureElement.appendChild(sandboxEl)
      t.sandbox = DefaultDOMElement.wrapNativeElement(sandboxEl)
      t.sandbox._shouldBeRemoved = true
    } else {
      let doc = DefaultDOMElement.createDocument('html')
      let sandbox = doc.createElement('div')
      doc.appendChild(sandbox)
      t.sandbox = sandbox
    }
  }
}

function _teardownSandbox(t) {
  const sandbox = t.sandbox
  // TODO: why is this so important?
  if (sandbox && sandbox._shouldBeRemoved) {
    sandbox.remove()
  }
}

export default TestFunction