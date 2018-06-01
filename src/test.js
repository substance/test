import tape from 'tape'
import { platform } from 'substance'
import addTestAPI from './addTestAPI'
import createTestSuiteHarness from './createTestSuiteHarness'

let test = tape
// add some extensions
addTestAPI(test)
if (platform.inBrowser) {
  test = createTestSuiteHarness(test)
}

export default test
