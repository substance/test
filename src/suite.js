import test from './test'
import TestSuite from './TestSuite'
import spy from './spy'

var testAPI = test.setupTestSuite(test)
testAPI.spy = spy
window.substanceTest = testAPI

window.onload = function() {
  TestSuite.mount({ harness: testAPI }, 'body')
}
