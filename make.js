// we are using an older version of bundler
// to build the bundler
var b = require('substance-bundler')
var bundleVendor = require('substance-bundler/util/bundleVendor')
var path = require('path')

b.task('substance', function() {
  b.make('substance')
})

b.task('clean', function() {
  b.rm('./dist')
  b.rm('./tmp')
})

b.task('vendor', function() {
  b.custom('Bundling vendor...', {
    // these are necessary for watch and ensureDir
    src: './.make/vendor.js',
    dest: './tmp/vendor.js',
    execute: function() {
      return bundleVendor({
        // ... and these are used for doing the work
        src: './.make/vendor.js',
        dest: './tmp/vendor.js',
        debug: true
      })
    }
  })
})

b.task('cjs', function() {
  b.js('src/api.js', {
    commonjs: {
      include: [ path.join(__dirname, 'tmp/vendor.js'), '/**/lodash/**', '/**/substance-cheerio/**' ],
      namedExports: { './tmp/vendor.js': ['tape', 'Test' ] },
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

b.task('default', ['clean', 'vendor', 'cjs'])
