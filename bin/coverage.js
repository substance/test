require('source-map-support').install()
const path = require('path')
const cp = require('child_process')

let testFile = path.join(process.cwd(), process.argv[2])
let _coverage = require.resolve('./_coverage.js')
let tapSpecFile = require.resolve('../dist/tap-spec.js')

let testRunner = cp.fork(_coverage, [testFile], {
  stdio: ['ignore', 'pipe', 2, 'ipc']
})
let tapeSepc = cp.fork(tapSpecFile, {
  stdio: ['pipe', 1, 2, 'ipc']
})

testRunner.stdout.pipe(tapeSepc.stdin)
