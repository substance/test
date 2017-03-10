require('source-map-support').install()

const istanbul = require('istanbul')
const path = require('path')
const {tape} = require('substance-test')

tape.onFinish(() => {
  let reporter = new istanbul.Reporter()
  let collector = new istanbul.Collector()
  collector.add(global.__coverage__)
  reporter.add('lcov')
  reporter.write(collector, true, () => {})
})

let testFile = path.join(process.cwd(), process.argv[2])
require(testFile)