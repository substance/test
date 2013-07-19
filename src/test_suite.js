"use strict";

var _ = require("underscore");
var fs = require("fs");
var Handlebars = require("handlebars");

// the testsuite serves an augmented index.html that contains all found tests
// specified in the given folders
var TestSuite = function(app, scope, folders, globalScripts) {

  var self = this;
  var scriptFiles = [];
  var scriptFileAbs = {};
  var page_template;

  this.list = function() {
    return Object.keys(testFiles);
  };

  this.get = function(script) {
    if (scriptFileAbs[script]) {
      return fs.readFileSync(scriptFileAbs[script], "utf8");
    } else {
      return "";
    }
  };

  this.createPage = function() {
    var data = {
      scope: scope,
      scripts: scriptFiles,
    };
    return page_template(data);
  };

  function init() {
    globalScripts = globalScripts || [];
    _.each(globalScripts, function(item) {
      scriptFiles.push(item.alias);
      scriptFileAbs[item.alias] = item.path;
    });

    console.log("TestSuite.init()", "folders", folders);
    _.each(folders, function(folderName) {
      var data = fs.readFileSync(folderName+"/index.json", "utf8");
      var files = JSON.parse(data);
      _.each(files, function(f) {
        var fn = folderName+"/"+f;
        scriptFiles.push(fn);
        scriptFileAbs[fn] = fn;
      })
    });
    console.log("TestSuite.init()", "scriptFiles", scriptFiles);
    var template = fs.readFileSync(__dirname+"/../server.hb", "utf8");
    page_template = Handlebars.compile(template);
  }

  if (app) {
    function createScopedExpression(expr) {
      var asStr;
      var scopeStr = scope;
      if (scope[scope.length-1] !== "/") {
        scopeStr = scope + "/";
      }
      scopeStr.replace("/", "\\/");
      asStr = "^"+scopeStr+expr+"$";
      console.log("createScopedExpression()", "asStr", asStr)
      return new RegExp(asStr);
    }

    app.get(scope,
      function(req, res, next) {
        res.send(self.createPage());
      }
    );

    app.get(createScopedExpression("(.+)"),
      function(req, res, next) {
        var testPath = req.params[0];
        res.send(self.get(testPath));
      }
    );
  }

  init();
};

module.exports = TestSuite;
