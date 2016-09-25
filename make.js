// we are using an older version of bundler
// to build the bundler
var b = require('substance-bundler')
var path = require('path')
var bundleBrowser = require('./.make/bundleBrowser')

b.task('substance', function() {
  b.make('substance')
})

b.task('clean', function() {
  b.rm('./dist')
  b.rm('./tmp')
})

b.task('tape', function() {
  b.custom('Bundling tape...', {
    // these are necessary for watch and ensureDir
    src: './.make/tape.js',
    dest: './tmp/tape.js',
    execute: function() {
      return _bundleBrowser({
        src: './.make/tape.js',
        dest: './tmp/tape.browser.js'
      })
    }
  })
})

b.task('cjs', function() {
  b.js('src/api.js', {
    commonjs: {
      include: [ '/**/tape/**', '/**/lodash/**', '/**/substance-cheerio/**' ],
    },
    // need buble if we want to minify later
    buble: { include: [ 'src/**' ] },
    sourceMap: true,
    targets: [{
      dest: './dist/test.cjs.js',
      format: 'cjs', moduleName: 'test'
    }]
  })
})

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
        ignore: ['substance-cheerio']
      })
    }
  })


  // b.js('src/suite.js', {
  //   ignore: [ 'substance-cheerio' ],
  //   resolve: {
  //     alias: {
  //       tape: path.join(__dirname, 'tmp/tape.browser.js')
  //     }
  //   },
  //   commonjs: {
  //     include: [ path.join(__dirname, 'tmp/tape.browser.js'), '/**/lodash/**', '/**/substance-cheerio/**' ],
  //   },
  //   // need buble if we want to minify later
  //   buble: { include: [ 'src/**' ] },
  //   sourceMap: true,
  //   targets: [{
  //     dest: './dist/testsuite.js',
  //     format: 'umd', moduleName: 'testSuite'
  //   }]
  // })
})

b.task('default', ['clean', 'vendor', 'cjs', 'suite'])
