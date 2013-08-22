"use strict";

var _ = require('underscore');
var util = require('substance-util');
var TestRunner = require('./test_runner')

var MochaTestRunner = function() {
  TestRunner.call(this);

  // runs a given substance test in vows
  var runTest = function(test) {
    describe(test.path.join("/"), function() {
      describe(test.name, function() {
        before(test.setup.bind(test));
        for (var idx = 0; idx < test.actions.length; idx++) {
          var action = test.actions[idx];
          it(action.label, action.func.bind(test));
        }
      });
    });
  };

  this.run = function() {
    _.each(this.tests, function(test) {
      runTest(test);
    }, this);
  };

};

module.exports = MochaTestRunner;
