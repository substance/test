require('source-map-support').install()
const isAbsolute = require('./_isAbsolute')
const path = require('path')
const cp = require('child_process')

let testFile = process.argv[2]
if (!isAbsolute(testFile)) {
  testFile = path.join(process.cwd(), testFile)
}
let _coverage = require.resolve('./_coverage.js')
let tapSpecFile = require.resolve('../dist/tap-spec.js')

let testRunner = cp.fork(_coverage, [testFile], {
  stdio: ['ignore', 'pipe', 2, 'ipc']
})
let tapSpec = cp.fork(tapSpecFile, {
  stdio: ['pipe', 1, 2, 'ipc']
})

testRunner.stdout.pipe(tapSpec.stdin)
