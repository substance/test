/* eslint-disable semi */
var fs = require('fs');
var browserify = require('browserify');
var babelify = require('babelify');
var es2015 = require('babel-preset-es2015')

module.exports = function bundleBrowser(opts) {
  opts = opts || {}
  var src = opts.src ;
  var dest = opts.dest;
  var external = opts.external || []
  var ignore = opts.ignore || []
  return new Promise(function(resolve, reject) {
    var b = browserify(src)
    external.forEach(function(m) {
      b.external(m)
    })
    ignore.forEach(function(m) {
      b.ignore(m)
    })
    b.transform(babelify, {
      global: true,
      ignore: /\/node_modules\/(?!substance\/)/,
      presets: [ es2015 ]
    })
    b.bundle(function(err, buf) {
      if(err) {
        reject(err);
      } else {
        fs.writeFileSync(dest, buf.toString());
        resolve();
      }
    });
  });
}
