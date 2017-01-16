import test from './test'
import TestSuite from './TestSuite'
import spy from './spy'

let _test = test.setupTestSuite(test)

window.substanceTest = {
  test: _test,
  module: _test.module,
  spy: spy
}

window.onload = function() {
  TestSuite.mount({ harness: _test }, 'body')
}
