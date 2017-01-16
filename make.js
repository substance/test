// we are using an older version of bundler
// to build the bundler
let b = require('substance-bundler')
let path = require('path')

b.task('substance', function() {
  b.make('substance')
})

b.task('clean', function() {
  b.rm('./dist')
  b.rm('./tmp')
})

const TAPE_BROWSER = path.join(__dirname, 'tmp/tape.browser.js')
const TAPE_NODE = path.join(__dirname, 'tmp/tape.cjs.js')

b.task('tape:browser', function() {
  b.browserify('./.make/tape.js', {
    dest: TAPE_BROWSER,
    module: true
  })
})

b.task('tape:node', function() {
  b.browserify('./.make/tape.js', {
    dest: TAPE_NODE,
    server: true,
    module: true
  })
})


// Bundling the test API for use in nodejs
b.task('api:node', ['tape:node'], function() {
  b.js('src/api.js', {
    target: {
      dest: './dist/test.cjs.js',
      format: 'cjs'
    },
    resolve: {
      alias: {
        // provides util.inherits
        // 'inherits': require.resolve('./.make/inherits.node.js'),
        'tape': './tape.cjs.js'
      }
    },
    // external: ['util', 'fs', 'path', 'stream', ],
    // external: [TAPE_NODE]
    commonjs: true,
    buble: true
  })
  b.copy('src/run-tests.js', 'dist/')
})

// Bundling the test API for use in the browser (e.g. in karma)
b.task('api:browser', ['tape:browser'], function() {
  let namedExports = {}
  namedExports[TAPE_BROWSER] = ['tape']
  b.js('./src/api.js', {
    target: {
      dest: './dist/test.browser.js',
      format: 'umd', moduleName: 'substanceTest'
    },
    resolve: {
      alias: {
        'tape': TAPE_BROWSER
      }
    },
    commonjs: {
      include: [TAPE_BROWSER],
      namedExports: namedExports
    },
    buble: true
  })
})

b.task('suite', ['tape:browser'], function() {
  b.copy('src/index.html', 'dist/')
  b.copy('src/test.css', 'dist/')
  let namedExports = {}
  namedExports[TAPE_BROWSER] = ['tape']
  b.js('./src/suite.js', {
    target: {
      dest: './dist/testsuite.js',
      format: 'umd', moduleName: 'testsuite'
    },
    resolve: {
      alias: {
        'tape': TAPE_BROWSER
      }
    },
    commonjs: {
      include: [TAPE_BROWSER],
      namedExports: namedExports
    },
    buble: true,
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

b.task('default', ['clean', 'substance', 'api', 'suite'])
