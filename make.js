// we are using an older version of bundler
// to build the bundler
var b = require('substance-bundler')
var bundleVendor = require('substance-bundler/util/bundleVendor')
var path = require('path')

var argv = b.yargs
  .boolean('d').alias('d', 'debug').default('d', false)
  .argv

b.task('substance', function() {
  b.make('substance')
})

b.task('clean', function() {
  b.rm('./dist')
})

b.task('vendor', function() {
  b.custom('Bundling vendor...', {
    // these are necessary for watch and ensureDir
    src: './.make/vendor.js',
    dest: './dist/vendor.js',
    execute: function() {
      return bundleVendor({
        // ... and these are used for doing the work
        src: './.make/vendor.js',
        dest: './dist/vendor.js',
        external: ['fsevents'],
        debug: argv.debug
      })
    }
  })
})

b.task('bundle', function() {
  b.js('src/main.js', {
    resolve: {
      alias: { 'lodash': 'lodash-es' },
      jsnext: ['substance']
    },
    // need buble if we want to minify later
    buble: { include: [ 'src/**' ] },
    // built-ins: i.e. these files will not be processed
    // leaving the corresponding require statements untouched
    external: [
      'assert', 'buffer', 'child_process', 'constants', 'events',
      'fs', 'os', 'path', 'stream', 'tty', 'url', 'util',
      path.join(__dirname, 'dist', 'vendor.js')
    ],
    sourceMap: true,
    targets: [{
      dest: './dist/test.js',
      format: 'cjs', moduleName: 'test'
    }]
  })
})

b.task('default', ['clean', 'vendor', 'bundle'])
