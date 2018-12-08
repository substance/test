let b = require('substance-bundler')
let path = require('path')

const TAPE_BROWSER = path.join(__dirname, 'tmp/tape.browser.js')
const TAPE_NODE = path.join(__dirname, 'tmp/tape.cjs.js')
const TAPE_SPEC = path.join(__dirname, 'dist/tap-spec.js')

b.task('clean', () => {
  b.rm('./dist')
  b.rm('./tmp')
})

b.task('tape:browser', () => {
  b.browserify('./.make/tape.js', {
    dest: TAPE_BROWSER,
    exports: ['default']
  })
})

b.task('tape:node', () => {
  b.browserify('./.make/tape.js', {
    dest: TAPE_NODE,
    server: true,
    exports: ['default']
  })
})

b.task('tap:spec', () => {
  b.browserify('./node_modules/tap-spec/bin/cmd.js', {
    dest: TAPE_SPEC,
    server: true
  })
})

// Bundling the test API for use in nodejs
b.task('api:node', ['tape:node'], () => {
  b.js('src/api.js', {
    output: [{
      file: './dist/test.cjs.js',
      format: 'cjs'
    }],
    alias: {
      'tape': TAPE_NODE
    },
    external: [ 'substance' ],
    commonjs: true,
    cleanup: true
  })
})

// Bundling the test API for use in the browser (e.g. in karma)
b.task('api:browser', ['tape:browser'], () => {
  b.js('./src/tape-api.js', {
    output: [{
      file: './dist/test.browser.js',
      format: 'umd',
      name: 'substanceTest',
      globals: { substance: 'window.substance' },
      sourcemap: false
    }],
    alias: {
      'tape': TAPE_BROWSER
    },
    external: [ 'substance' ],
    commonjs: true,
    cleanup: true
  })
})

b.task('suite', ['tape:browser'], () => {
  b.copy('src/index.html', 'dist/')
  b.copy('src/test.css', 'dist/')
  b.js('./src/suite.js', {
    output: [{
      file: './dist/testsuite.js',
      format: 'umd',
      name: 'testsuite',
      globals: { substance: 'window.substance' }
    }],
    alias: {
      'tape': TAPE_BROWSER
    },
    external: [ 'substance' ],
    commonjs: true,
    cleanup: true
  })
})

b.task('example', () => {
  b.js('./test/index.js', {
    output: [{
      file: './tmp/tests.js',
      format: 'umd',
      name: 'tests',
      globals: { 'substance-test': 'substanceTest' }
    }],
    external: [ 'substance-test' ]
  })
})

b.task('api', ['api:node', 'api:browser'])

b.task('default', ['clean', 'tap:spec', 'api', 'suite'])
