// we are using an older version of bundler
// to build the bundler
var b = require('substance-bundler')
// var path = require('path')
var bundleBrowser = require('./.make/bundleBrowser')

b.task('substance', function() {
  b.make('substance')
})

b.task('clean', function() {
  b.rm('./dist')
  b.rm('./tmp')
})

// Bundling the test API for use in nodejs
b.task('api:node', function() {
  b.js('src/api.js', {
    commonjs: {
      include: [ '/**/tape/**', '/**/lodash/**', '/**/substance-cheerio/**' ],
    },
    // need buble if we want to minify later
    buble: { include: [ 'src/**' ] },
    sourceMap: true,
    targets: [{
      dest: './dist/test.cjs.js',
      format: 'cjs', moduleName: 'substanceTest'
    }]
  })
  b.copy('src/run-tests.js', 'dist/')
})

// Bundling the test API for use in the browser (e.g. in karma)
b.task('api:browser', function() {
  b.custom('Bundling browser api...', {
    // these are necessary for watch and ensureDir
    src: './src/api.js',
    dest: './dist/test.browser.js',
    execute: function() {
      return bundleBrowser({
        src: './src/api.js',
        dest: './dist/test.browser.js',
        ignore: ['substance-cheerio'],
        browserify: {
          debug: true,
          standalone: 'substanceTest'
        }
      })
    }
  })
})

b.task('api', ['api:node', 'api:browser'])

b.task('suite', function() {
  b.copy('src/index.html', 'dist/')
  b.copy('src/test.css', 'dist/')
  b.custom('Bundling suite...', {
    // these are necessary for watch and ensureDir
    src: './src/suite.js',
    dest: './dist/testsuite.js',
    execute: function() {
      return bundleBrowser({
        src: './src/suite.js',
        dest: './dist/testsuite.js',
        ignore: ['substance-cheerio'],
        browserify: {
          debug: true
        }
      })
    }
  })
})

b.task('default', ['clean', 'api', 'suite'])
