(function() {

var root = this;
if (typeof exports !== 'undefined') {
  var _    = require('underscore');
  var util   = require('./lib/util/util');
  var seeds   = require('./lib/util/seeds');
} else {
  var _ = root._;
  var util = root.Substance.util;
  var seeds   = root.Substance.seeds;
}

// Expands the actions into a unified format.
// For convenienve, tests maybe be declared in a simpler format.
function compileActions(testSpec) {

  // console.log("expand actions...");
  var actions = [];
  var action = null;

  function action_template() {
    return {
      'label': [],
      'type': testSpec.defaultType || "composer",
      'func': null
    };
  }

  function complete_action() {
     actions.push(action);
     action = action_template();
  };

  action = action_template();

  _.each(testSpec.actions, function(elem) {
    var objType = Object.prototype.toString.call(elem);
    // actions can be declared in a declarative way in as a sequence of
    // functions (=actions) separated by strings which are used
    // as labels or to specify the platform
    if(objType === '[object String]') {
        if (elem === 'composer' || elem === 'hub') {
          action.type = elem;
        } else {
          action.label.push(elem);
        }
    }
    // alternatively, only the action body can be given
    else if (objType === '[object Function]') {
      action.func = elem;
      complete_action();
    }
    // and also a direct version as object
    else {
      if (elem.func) action.func = action.func;
      if (elem.label) action.label = action.label;
      if (elem.type) action.type = action.type;
      complete_action();
    };
  });

  return actions;
}

// TODO: refactor tests. Defining tests should be simple. OTOH, it should be possible to reuse
//  tests via sub-classing...
var Test = function() {};

Test.__prototype__ = function() {

  this.run = function(cb) {
    var self = this;
    var seedData = []

    function setup(cb) {

      // Note: the global session is a singleton and must not be replaced
      //  as event observers are attached...

      // To allow to change this in future we provide the session as a member variable.
      // Make sure to use 'this.session' in tests.
      self.session = new Substance.Session({env:"test"});

      try {
        console.log("## Setup");
        // asynchronous actions
        if (self.setup.length == 0) {
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

    // TODO: this can be done statically (without using selector)
    var loadSeed = util.async.iterator({
      selector: function() { return self.seeds; },
      iterator: function(seedSpec, cb) {
        // console.log("load seed...");
        var isInlineSpec = !_.isString(seedSpec);

        // The seed can be specified inline or be given as string referencing a seed file.
        // For the former, the spec has to be pre-processed to initialize optional settings.
        // For the latter, the referenced seed spec file has to be loaded.
        function loadSeedSpec(cb) {
          if(!isInlineSpec) {
            seeds.loadSeedSpec(seedSpec, function(err, data) {
              seedSpec = data;
              cb(err);
            });
          } else {
            seeds.prepareSeedSpec(seedSpec, function(err, data) {
              seedSpec = data;
              cb(err);
            });
          }
        }

        function loadSeed(cb) {
          seeds.loadSeed(seedSpec, function(err, seed) {
            if (seed) seedData.push(seed);
            cb(err);
          });
        }

        util.async.sequential([loadSeedSpec, loadSeed], cb);
      }
    });

    var seedAll = util.async.iterator({
      selector: function() { return seedData; },
      iterator: function(seed, cb) {
        // console.log("Seeding local store...", seedSpec.local);
        self.session.seed(seed.local);
        // console.log("Seeding remote store...", seedSpec.remote);
        self.session.client.seed(seed, function(err) {
          if(err) return cb(err);
          cb(null)
        });
      }
    });

    function runActions(cb) {

      var options = {
        items: self.actions,
        iterator: function(action, cb) {
          try {
            console.log("## Action:", action.label.join(" "));
            // asynchronous actions
            if (action.func.length == 0) {
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
      functions: [setup, loadSeed, seedAll, runActions, finish],
      finally: function(err) {
        self.tearDown();
        initSession("test");
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
_.extend(Test.prototype, util.Events);

// a place to register tests
var tests = {}
var testTree = {};

function pathToId(path) {
  var id = path.join("_");
  id = id.replace(/[:@/]/g, "").replace(/\s/g, "_");
  return id;
}

// a global method to register a test
var registerTest = function(path, newTest) {

  // TODO remove this legacy after refactoring old style tests
  if(arguments.length == 1) {

    newTest = path;
    path = newTest.category ? [newTest.category] : [];
    newTest.path = path;

  } else {
    // create an id from the path
    newTest.id = pathToId(path);

    // the last entry of the path is taken as name
    newTest.name = path.pop();
    newTest.path = path;
  }

  if (!(newTest instanceof Test) ) {
    newTest = _.extend(new Test(), newTest);
  }

  // A list of actions which will be executed in turn.
  // In test specs actions can be defined in a sparse/sloppy way.
  // They get expanded to a unified format automatically.
  newTest.actions = compileActions(newTest);

  // HACK: for now only composer side test execution
  newTest.env = "composer";
  tests[newTest.id] = newTest;
}

function getTestTree() {
  var tree = {};

  _.each(tests, function(test, key) {
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
var _module = {
  Test: Test,
  tests: tests,
  registerTest: registerTest,
  getTestTree: getTestTree
};

if (typeof exports === 'undefined') {
  _.extend(root.Substance, _module);
} else {
  module.exports = _module;
}

}).call(this);
