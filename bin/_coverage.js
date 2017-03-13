require('source-map-support').install()
const isAbsolute = require('./_isAbsolute')
const istanbul = require('istanbul')
const path = require('path')

// HACK: register to all 'tape' variants as we find them

let tapes = []
try {
  let { tape } = require('substanceTape')
  if (tape) tapes.push(tape)
} catch(err) {}
try {
  let tape = require('tape')
  if (tape) tapes.push(tape)
} catch(err) {}

tapes.forEach((tape) => {
  tape.onFinish(() => {
    let reporter = new istanbul.Reporter()
    let collector = new istanbul.Collector()
    collector.add(global.__coverage__)
    reporter.add('lcov')
    reporter.write(collector, true, () => {})
  })
})

let testFile = process.argv[2]
require(testFile)
