require('source-map-support').install()
const isAbsolute = require('./_isAbsolute')
const path = require('path')
const cp = require('child_process')

let testFile = process.argv[2]
if (!isAbsolute(testFile)) {
  testFile = path.join(process.cwd(), testFile)
}
let tapSpecFile = require.resolve('../dist/tap-spec.js')

let testRunner = cp.fork(testFile, {
  stdio: ['ignore', 'pipe', 2, 'ipc']
})
let tapeSepc = cp.fork(tapSpecFile, {
  stdio: ['pipe', 1, 2, 'ipc']
})

testRunner.on('error', function(error) {
  console.error(error)
  process.exit(1)
})

testRunner.on('close', function(exitCode) {
  process.exit(exitCode)
})

testRunner.stdout.pipe(tapeSepc.stdin)
