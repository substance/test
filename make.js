let b = require('substance-bundler')
let path = require('path')

const TAPE_BROWSER = path.join(__dirname, 'tmp/tape.browser.js')
const TAPE_NODE = path.join(__dirname, 'tmp/tape.cjs.js')
const TAPE_SPEC = path.join(__dirname, 'dist/tap-spec.js')

b.task('clean', function() {
  b.rm('./dist')
  b.rm('./tmp')
})

b.task('tape:browser', function() {
  b.browserify('./.make/tape.js', {
    dest: TAPE_BROWSER,
    exports: ['default']
  })
})

b.task('tape:node', function() {
  b.browserify('./.make/tape.js', {
    dest: TAPE_NODE,
    server: true,
    exports: ['default']
  })
})

b.task('tap:spec', function() {
  b.browserify('./node_modules/tap-spec/bin/cmd.js', {
    dest: TAPE_SPEC,
    server: true
  })
})

// Bundling the test API for use in nodejs
b.task('api:node', ['tape:node'], function() {
  b.js('src/api.js', {
    target: {
      dest: './dist/test.cjs.js',
      format: 'cjs'
    },
    alias: {
      'tape': TAPE_NODE
    },
    commonjs: true,
    buble: true,
    cleanup: true
  })
})

// Bundling the test API for use in the browser (e.g. in karma)
b.task('api:browser', ['tape:browser'], function() {
  b.js('./src/api.js', {
    target: {
      dest: './dist/test.browser.js',
      format: 'umd', moduleName: 'substanceTest'
    },
    alias: {
      'tape': TAPE_BROWSER
    },
    commonjs: true,
    buble: true,
    cleanup: true
  })
})

b.task('suite', ['tape:browser'], function() {
  b.copy('src/index.html', 'dist/')
  b.copy('src/test.css', 'dist/')
  b.js('./src/suite.js', {
    target: {
      dest: './dist/testsuite.js',
      format: 'umd', moduleName: 'testsuite'
    },
    alias: {
      'tape': TAPE_BROWSER
    },
    commonjs: true,
    buble: true,
    cleanup: true
  })
})

b.task('example', function() {
  b.js('./test/index.js', {
    target: {
      dest: './tmp/tests.js',
      format: 'umd', moduleName: 'tests'
    },
    external: { 'substance-test': 'substanceTest' }
  })
})

b.task('api', ['api:node', 'api:browser'])

b.task('default', ['clean', 'tap:spec', 'api', 'suite'])
