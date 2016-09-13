import { substanceGlobals } from 'substance'
import harness from './test'
import TestSuite from './TestSuite'

substanceGlobals.TEST_UI = true

window.onload = function() {
  TestSuite.mount({ harness: harness }, 'body')
}
