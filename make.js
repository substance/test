let b = require('substance-bundler')
let rollup = require('substance-bundler/extensions/rollup')
let nodeResolve = require('rollup-plugin-node-resolve')
let commonjs = require('rollup-plugin-commonjs')
let nodeBuiltins = require('rollup-plugin-node-builtins')
let nodeGlobals = require('rollup-plugin-node-globals')
let path = require('path')

const TMP = path.join(__dirname, 'tmp')

b.task('clean', () => {
  b.rm('./dist')
  b.rm('./tmp')
})

b.task('tape:browser', () => {
  rollup(b, {
    input: './.make/tape.js',
    output: {
      file: path.join(TMP, 'tape.browser.js'),
      format: 'umd',
      name: 'tape'
    },
    plugins: [
      nodeResolve({
        preferBuiltins: true
      }),
      commonjs(),
      nodeBuiltins()
    ]
  })
})

b.task('tape:node', () => {
  rollup(b, {
    input: '.make/tape.js',
    output: {
      file: path.join(TMP, 'tape.cjs.js'),
      format: 'commonjs'
    },
    plugins: [
      nodeResolve({
        preferBuiltins: true
      }),
      commonjs(),
      nodeBuiltins()
    ]
  })
})

// Bundling the test API for use in nodejs
b.task('api:node', ['tape:node'], () => {
  rollup(b, {
    input: 'src/api.cjs.js',
    output: [{
      file: './dist/test.cjs.js',
      format: 'cjs'
    }],
    plugins: [
      _resolveTape({
        tape: path.join(TMP, 'tape.cjs.js')
      }),
      nodeResolve(),
      commonjs()
    ],
    external: ['events', 'fs', 'path', 'stream', 'util']
  })
})

// Bundling the test API for use in the browser (e.g. in karma)
b.task('api:browser', ['tape:browser'], () => {
  rollup(b, {
    input: './src/api.browser.js',
    output: [{
      file: './dist/test.browser.js',
      format: 'umd',
      name: 'substanceTest'
    }],
    plugins: [
      _resolveTape({
        tape: path.join(TMP, 'tape.browser.js')
      }),
      nodeResolve({
        preferBuiltins: true
      }),
      commonjs(),
      nodeBuiltins(),
      nodeGlobals()
    ]
  })
})

b.task('suite', ['tape:browser'], () => {
  b.copy('src/index.html', 'dist/')
  b.copy('src/test.css', 'dist/')
  rollup(b, {
    input: './src/suite.js',
    output: {
      file: './dist/testsuite.js',
      format: 'umd',
      // Note: important registering this at the same global name as the API
      name: 'substanceTest'
    },
    plugins: [
      _resolveTape({
        tape: path.join(TMP, 'tape.browser.js')
      }),
      nodeResolve({
        preferBuiltins: true
      }),
      commonjs(),
      nodeBuiltins(),
      nodeGlobals()
    ]
  })
})

b.task('api', ['api:node', 'api:browser'])

b.task('default', ['clean', 'api', 'suite'])

function _resolveTape (options = {}) {
  return {
    name: '_resolve-tape',
    resolveId (source) {
      if (source === 'tape') {
        return options.tape
      }
      return null
    }
  }
}
