var http = require('http');
var express = require('express');
var TestSuite = require("./src/test_suite");

var createApp = function() {
  var app = express();

  app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
  });
  return app;
};

var app = createApp();

var globalScripts = [
  { alias: "underscore.js", path: __dirname +"/node_modules/underscore/underscore.js" },
  { alias: "substance-util/utils.js", path: __dirname +"/node_modules/substance-util/util.js" },
  { alias: "substance-test/test.js", path: __dirname +"/test.js" },
  { alias: "substance-test/assert.js", path: __dirname +"/assert.js" }
];

var container = new TestSuite(app, "/", ["tests"], globalScripts);

var port = app.get('port');
http.createServer(app).listen(port, function(){
  console.log("TestSuite running on port " + port)
  console.log("http://127.0.0.1:"+port+"/testsuite");
});
