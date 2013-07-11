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

var Test = function() {};

Test.__prototype__ = function() {

  this.run = function(cb) {
    var self = this;

    var report = [];

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

    /*
                "label": ["Open Doc for editing"],
            "error": {"message": "Some error", "stack_trace": []},
            "duration": 23124,
            "sourcecode": "function(foo) {\nconsole.log('meh'); \n}"

    */ 

    function runActions(cb) {
      var options = {
        items: self.actions,
        iterator: function(action, cb) {
          var reportItem = {
            label: action.label,
            sourcecode: action.func.toString(),
            duration: 0
          };
          try {
            console.log("## Action:", action.label);
            // asynchronous actions
            if (action.func.length === 0) {
              action.func.call(self);
              self.trigger('action:success', null, action);
              report.push(reportItem);
              cb(null);
            } else {
              action.func.call(self, function(err, data) {
                if (err) {
                  console.error(err.toString());
                  util.printStackTrace(err, 1);
                  self.trigger('action:error', err, action);
                  reportItem.error = {message: err.message, stack_trace: err.stack };
                } else self.trigger('action:success', null, action);
                report.push(reportItem);
                cb(err, data);
              });
            }
          } catch(err) {
            console.error(err.name+":", err.message);
            util.printStackTrace(err, 1);
            self.trigger('action:error', err, action);
            reportItem.error = {message: err.message, stack_trace: err.stack };
            report.push(reportItem);
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

    console.log("# Test:", self.path.join("/"),"/", self.name);
    var options = {
      functions: [setup, runActions, finish],
      finally: function(err) {
        self.tearDown();
        cb(err, report);
      }
    };
    if (cb === undefined) {
      cb = function(err) {
        if (err) console.log(err, report);
      };
    }
    util.async.sequential(options, cb);
  };

  // a stub setup function called before running test action
  this.setup = function() {};

  this.tearDown = function() {};
};

Test.prototype = _.extend(new Test.__prototype__(), util.Events);


// Global Test Registry
// --------
//
// Raw tests will be stored here.

Test.testSpecs = Test.testSpecs || {};

// Normalize path to get a proper id
// --------
//

var pathToId = function(path) {
  var id = path.join("_");
  id = id.replace(/[:@/()]/g, "").replace(/\s/g, "_");
  return id;
};

Test.registerTest = function(path, testSpec) {
  var id = pathToId(path);
  testSpec.id = id;
  testSpec.path = path;
  Test.testSpecs[id] = testSpec;
};



if (typeof exports === 'undefined') {
  root.Substance.Test = Test;
} else {
  module.exports = Test;
}

})(this);
