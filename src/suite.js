import createTestSuiteHarness from './createTestSuiteHarness'
import createModuleFunction from './createModuleFunction'
import addTestAPI from './addTestAPI'
import TestSuite from './TestSuite'
import spy from './spy'

// add some extensions
addTestAPI()

const harness = createTestSuiteHarness()

window.substanceTest = { test, module, spy }

window.onload = function() {
  TestSuite.mount({ harness }, 'body')
}
