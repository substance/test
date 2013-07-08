var http = require('http');
var express = require('express');
var TestContainer = require("./test_container");

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
var container = new TestContainer(["tests"], app);

app.get('/testsuite', function(req, res) {
  res.sendfile(__dirname + '/server.html');
});

var port = app.get('port');
http.createServer(app).listen(port, function(){
  console.log("TestSuite running on port " + port)
  console.log("http://127.0.0.1:"+port+"/testsuite");
});
