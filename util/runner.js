// enabling source maps so that errors in bundler can be traced
require('source-map-support').install()

module.exports = function(pathToTests) {
  require(pathToTests)
}
