import * as substanceTest from './api'
import createTestSuiteHarness from './createTestSuiteHarness'
import TestSuite from './TestSuite'

const harness = createTestSuiteHarness()

window.substanceTest = substanceTest

window.onload = () => {
  TestSuite.mount({ harness }, 'body')
}
