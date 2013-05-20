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

var Test = function(testSpec) {

  this.id = testSpec.id;
  this.name = testSpec.name;
  this.category = testSpec.category;
  this.spec = testSpec;

  // A list of actions which will be executed in turn.
  // In test specs actions can be defined in a sparse/sloppy way.
  // They get expanded to a unified format automatically.
  this.actions = compileActions(testSpec);

};

Test.__prototype__ = function() {

  this.run = function(cb) {
    var self = this;
    var spec = self.spec;
    self.seeds = []

    // TODO: this can be done statically (without using selector)
    var loadSeed = util.async.iterator({
      selector: function() { return spec.seeds; },
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
            if (seed) self.seeds.push(seed);
            cb(err);
          });
        }

        util.async.sequential([loadSeedSpec, loadSeed], cb);
      }
    });

    var seedAll = util.async.iterator({
      selector: function() { return self.seeds; },
      iterator: function(seedSpec, cb) {
        // console.log("Seeding local store...", seedSpec.local);
        session.seed(seedSpec.local);
        // console.log("Seeding remote store...", seedSpec.remote);
        session.client.store.seed(seedSpec, function(err) {
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
                if (err) self.trigger('action:error', err, action);
                else self.trigger('action:success', null, action);
                cb(err, data);
              });
            }
          } catch(err) {
            if(err.log) err.log();
            else console.log(err.toString(), err, err.stack);
            self.trigger('action:error', err, action);
            cb(err);
          }
        }
      };
      util.async.each(options, cb);
    }

    console.log("# Test:", self.category,"/", self.name);
    util.async.sequential([loadSeed, seedAll, runActions], cb);
  };

};

Test.prototype = new Test.__prototype__();
_.extend(Test.prototype, util.Events);

// a module used for exporting
var test = {

  Test: Test,

  // a place to register tests
  tests: {}

};

// a global method to register a test
test.registerTest = function(testSpec) {
  var newTest = new Test(testSpec);
  // HACK: for now only composer side test execution
  newTest.env = "composer";
  test.tests[testSpec.id] = newTest;
}


// Export Module
// --------

if (typeof exports === 'undefined') {
  _.extend(root.Substance, test);
} else {
  module.exports = test;
}

}).call(this);
