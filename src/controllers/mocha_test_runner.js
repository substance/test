(function(root) {

var _,
    util,
    TestRunner;

if (typeof exports !== 'undefined') {
  _ = require('underscore');
  util = require('substance-util');
  TestRunner = require('./test_runner')
} else {
  _ = root._;
  util = root.Substance.util;
  Test = root.Substance.Test.MochaTestRunner;
}


var MochaTestRunner = function() {
  TestRunner.call(this);

  // runs a given substance test in vows
  var runTest = function(test) {
    describe(test.path.join("/"), function() {
      describe(test.name, function() {
        it("Setup", test.setup.bind(test));
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

})(this);
