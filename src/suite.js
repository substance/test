import * as substanceTest from './api'
import TestSuite from './TestSuite'

window.substanceTest = substanceTest

window.onload = () => {
  TestSuite.mount({ harness: substanceTest.test }, 'body')
}
