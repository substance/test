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

testRunner.stdout.pipe(tapeSepc.stdin)
