(function(root) {

var _,
    util;

if (typeof exports !== 'undefined') {
  _    = require('underscore');
  util   = require('substance-util');
} else {
  _ = root._;
  util = root.Substance.util;
}


// TODO: refactor tests. Defining tests should be simple. OTOH, it should be possible to reuse
//  tests via sub-classing...
var Test = function() {};

Test.__prototype__ = function() {

  this.run = function(cb) {
    var self = this;

    function setup(cb) {

      try {
        console.log("## Setup");
        // asynchronous actions
        if (self.setup.length === 0) {
          self.setup();
          cb(null);
        } else {
          self.setup(cb);
        }
      } catch(err) {
        console.log("Caught error during setup:", err);
        util.printStackTrace(err, 1);
        cb(err);
      }
    }

    function runActions(cb) {

      var options = {
        items: self.actions,
        iterator: function(action, cb) {
          try {
            console.log("## Action:", action.label.join(" "));
            // asynchronous actions
            if (action.func.length === 0) {
              action.func.call(self);
              self.trigger('action:success', null, action);
              cb(null);
            } else {
              action.func.call(self, function(err, data) {
                if (err) {
                  console.error(err.toString());
                  util.printStackTrace(err, 1);
                  self.trigger('action:error', err, action);
                } else self.trigger('action:success', null, action);
                cb(err, data);
              });
            }
          } catch(err) {
            console.error(err.name+":", err.message);
            util.printStackTrace(err, 1);
            self.trigger('action:error', err, action);
            cb(err);
          }
        }
      };

      util.async.each(options, cb);
    }

    function finish(cb) {
      console.log("# Finished Test: ", self.name);
      cb(null);
    }

    console.log("# Test:", self.category,"/", self.name);
    var options = {
      functions: [setup, runActions, finish],
      finally: function(err) {
        self.tearDown();
        cb(err);
      }
    };
    util.async.sequential(options, cb);
  };

  // a stub setup function called before running test action
  this.setup = function() {};

  this.tearDown = function() {};
};

Test.prototype = new Test.__prototype__();


// Export Module
// --------

// a module used for exporting
var substance_test = {
  Test: Test,
  tests: tests,
  registerTest: registerTest,
  getTestTree: getTestTree
};

if (typeof exports === 'undefined') {
  _.extend(root.Substance, substance_test);
} else {
  module.exports = substance_test;
  var adapter = require('./src/mocha_adapter');
  module.exports.registerTest = function(path, test) {
    adapter(prepareTest(path, test));
  };
}

})(this);
