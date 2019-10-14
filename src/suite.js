import tape from 'tape'
import { getMountPoint, spy, testAsync, wait } from './api.browser'
import TestSuite from './TestSuite'
import createTestSuiteHarness from './createTestSuiteHarness'
import makeTestRestartable from './makeTestRestartable'

const TestClass = tape.Test
makeTestRestartable(TestClass)
const harness = createTestSuiteHarness(tape)
const test = harness.testFunc

window.onload = () => {
  TestSuite.mount({ harness }, 'body')
}

export default { test, getMountPoint, spy, testAsync, wait, harness }
