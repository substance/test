import { DefaultDOMElement, platform } from 'substance'

export default function getMountPoint (t) {
  // when running with substance-test we get
  // a sandbox for each test
  if (t.sandbox) return t.sandbox
  // if we are in the browser we append an element to the body
  if (platform.inBrowser) {
    let bodyEl = DefaultDOMElement.wrap(window.document.body)
    let sandboxEl = bodyEl.createElement('div')
    bodyEl.append(sandboxEl)
    return sandboxEl
  } else {
    // otherwise we create a detached DOM
    let htmlDoc = DefaultDOMElement.parseHTML('<html><body></body></html>')
    return htmlDoc.find('body')
  }
}
