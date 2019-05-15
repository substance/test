import * as substanceTest from './api.browser'
import TestSuite from './TestSuite'

window.onload = () => {
  TestSuite.mount({ harness: substanceTest.harness }, 'body')
}

export default substanceTest
