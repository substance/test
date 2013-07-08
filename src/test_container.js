(function() {

var _ = require("underscore");
var fs = require("fs");

var TestContainer = function(folders, app) {

  var self = this;
  var testFiles = {};

  this.list = function() {
    return Object.keys(testFiles);
  }

  this.get = function(test) {
    if (testFiles[test]) {
      return fs.readFileSync(testFiles[test], "utf8");
    } else {
      return "";
    }
  }

  function init() {
    _.each(folders, function(folderName) {
      var data = fs.readFileSync(folderName+"/test.json", "utf8");
      var files = JSON.parse(data);
      _.each(files, function(f) {
        var fn = folderName+"/"+f;
        testFiles[fn] = fn;
      })
    });
  }

  init();

  if (app) {
    app.get('/tests',
      function(req, res, next) {
        res.json(self.list());
      }
    );

    app.get(/^\/tests\/(.+)$/,
      function(req, res, next) {
        var testPath = req.params[0];
        res.send(self.get(testPath));
      }
    );
  }
};

module.exports = TestContainer;

})(this);
