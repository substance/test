"use strict";

var app = require("substance-application");
var util = require("substance-util");
var View = app.View;


// Substance.TestReport
// ==========================================================================

var TEST_REPORT = {
  "label": ["Enter some text"],
  "error": {"message": "Nope", "stack_trace": []},
  "duration": 23124,
  "sourcecode": "function(foo) {\nconsole.log('meh'); \n}"
};

var TestAction = function(options) {
  View.call(this);

  // For outgoing events
  // this.session = options.session;
  // this.$el.delegate("#login_form", "submit", _.bind(this.login, this));
};

TestAction.Prototype = function() {

  // this.authenticationError = function(err) {
  //   alert('Login failed');
  // };

  this.render = function() {
    var that = this;
    this.$el.html("HELLO FROM THE TEST CENTRE");

    return this;
  };

  this.dispose = function() {
    this.disposeHandlers();
  };
};

TestAction.Prototype.prototype = View.prototype;
TestAction.prototype = new TestAction.Prototype();

module.exports = TestAction;
