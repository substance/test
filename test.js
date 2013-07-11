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

// Expands the actions into a unified format.
// For convenienve, tests maybe be declared in a simpler format.
var compileActions = function(testSpec) {

  // console.log("expand actions...");
  var actions = [];
  var action = null;

  function action_template() {
    return {
      'label': "unknown",
      'func': null
    };
  }

  function complete_action() {
     actions.push(action);
     action = action_template();
  }

  action = action_template();

  _.each(testSpec.actions, function(elem) {
    var objType = Object.prototype.toString.call(elem);
    // actions can be declared in a declarative way in as a sequence of
    // functions (=actions) separated by strings which are used
    // as labels or to specify the platform
    if(objType === '[object String]') {
      action.label = elem;
    }
    // alternatively, only the action body can be given
    else if (objType === '[object Function]') {
      action.func = elem;
      complete_action();
    }
    // and also a direct version as object
    else {
      if (elem.func) action.func = elem.func;
      if (elem.label) action.label = elem.label;
      complete_action();
    }
  });

  return actions;
};

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
            console.log("## Action:", action.label);
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

    console.log("# Test:", self.path.join("/"),"/", self.name);
    var options = {
      functions: [setup, runActions, finish],
      finally: function(err) {
        self.tearDown();
        cb(err);
      }
    };
    if (cb === undefined) {
      cb = function(err) {
        if (err) console.log(err);
      }
    }
    util.async.sequential(options, cb);
  };

  // a stub setup function called before running test action
  this.setup = function() {};

  this.tearDown = function() {};
};

Test.prototype = _.extend(new Test.__prototype__(), util.Events);

// a place to register tests
var tests = {};

function pathToId(path) {
  var id = path.join("_");
  id = id.replace(/[:@/()]/g, "").replace(/\s/g, "_");
  return id;
}

var prepareTest = function(path, newTest) {
  // create an id from the path
  newTest.id = pathToId(path);

  // the last entry of the path is taken as name
  newTest.name = path.pop();
  newTest.path = path;

  if (!(newTest instanceof Test) ) {
    newTest = _.extend(new Test(), newTest);
  }

  // A list of actions which will be executed in turn.
  // In test specs actions can be defined in a sparse/sloppy way.
  // They get expanded to a unified format automatically.
  newTest.actions = compileActions(newTest);

  return newTest;
};

// a global method to register a test
var registerTest = function(path, newTest) {
  newTest = prepareTest(path, newTest);
  tests[newTest.id] = newTest;
};

function getTestTree() {
  var tree = {};

  _.each(tests, function(test) {
    var obj = tree;
    var subpath = [];
    _.each(test.path, function(key) {
      subpath.push(key);
      if(!obj[key]) {
        obj[key] = {
          id: pathToId(subpath),
          name: key
        };
      }
      obj = obj[key];
    });
    obj[test.name] = test;
  });

  return tree;
}

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
