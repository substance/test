import tape from 'tape'
import { platform } from 'substance'
import addTestAPI from './addTestAPI'
import createTestSuiteHarness from './createTestSuiteHarness'
import makeTestRestartable from './makeTestRestartable'

const TestClass = tape.Test

let testFunc
if (platform.inBrowser) {
  // monkey-patch the original Test class adding Test.prototype.reset()
  makeTestRestartable(TestClass)
  let harness = createTestSuiteHarness(tape)
  testFunc = harness.testFunc
} else {
  testFunc = tape
}
// add some extensions
addTestAPI(TestClass)

export default testFunc
