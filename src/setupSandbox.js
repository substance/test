import clone from 'substance/util/clone'
import forEach from 'substance/util/forEach'
import isNil from 'substance/util/isNil'
import inBrowser from 'substance/util/inBrowser'
import platform from 'substance/util/platform'
import substanceGlobals from 'substance/util/substanceGlobals'
import DefaultDOMElement from 'substance/dom/DefaultDOMElement'
import Test from './Test'
import tape from 'tape'


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