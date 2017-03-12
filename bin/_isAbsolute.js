var path = require('path')

module.exports = function isAbsolute(p) {
  return path.resolve(p) === path.normalize(p)
}
