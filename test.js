(function() {

var root = this;
var util = (typeof exports === 'undefined') ? Substance.util : require("../util/util");


function seedLocalStore(seeds, cb) {
  console.log('Seeding the docstore...', seeds);

  // flush the test store
  session.localStore.clear();

  if (seeds) {
    _.each(seeds, function(seed, scope) {
       new Substance.RedisStore({
        scope: session.env+":"+scope
      }).seed(seed);
    });
  }

  if (cb) cb(null);
  return true;
}

var Test = function(testSpec) {
  var self = this;

  this.id = testSpec.id;
  this.name = testSpec.name;
  this.category = testSpec.category;
  this.spec = testSpec;

  // A list of actions which will be executed in turn.
  // In test specs actions can be defined in a sparse/sloppy way.
  // They get expanded to a unified format automatically.
  this.actions = [];

  // Expands the actions into a unified format.
  // For convenienve, tests maybe be declared in a simpler format.
  function buildActions() {
    // console.log("expand actions...");
    var _actions = [];
    var _action = null;

    function action_template() {
      return {
        'label': [],
        'type': test.defaultType,
        'func': null
      };
    }

    function complete_action() {
       _actions.push(_action);
       _action = action_template();
    };

    _action = action_template();

    _.each(test.actions, function(elem) {
      var objType = Object.prototype.toString.call(elem);
      // actions can be declared in a declarative way in as a sequence of
      // functions (=actions) separated by strings which are used
      // as labels or to specify the platform
      if(objType === '[object String]') {
          if (elem === 'composer' || elem === 'hub') {
            _action.type = elem;
          } else {
            _action.label.push(elem);
          }
      }
      // alternatively, only the action body can be given
      else if (objType === '[object Function]') {
        _action.func = elem;
        complete_action();
      }
      // and also a direct version as object
      else {
        if (elem.func) _action.func = action.func;
        if (elem.label) _action.label = action.label;
        if (elem.type) _action.type = action.type;
        complete_action();
      };
    });
    self.actions = _actions;
  }

  this.run = function(cb) {

    self.seeds = []

    var _loadSeed = util.async.iterator({
      selector: function(test) { return test.spec.seeds; },
      iterator: function(seedName_or_seedSpec, idx, test, cb) {
        console.log("load seed...");
        // do not load a seed if it is defined inline or has been loaded already
        var isInline = !_.isString(seedName_or_seedSpec);
        if (isInline) {
          var seedSpec = seedName_or_seedSpec;
          util.prepareSeedSpec(seedSpec, function(err, seedSpec) {
            if (err) return cb(err);
            util.loadSeed(seedSpec, function(err, seed) {
              if (err) return cb(err);
              test.seeds.push(seed);
              cb(null, test);
            });
          });
        } else {
          util.loadSeedSpec(seedName_or_seedSpec, function(err, seedSpec) {
            if (err) return cb(err);
            util.loadSeed(seedSpec, function(err, seed) {
              if (err) return cb(err);
              test.seeds.push(seed);
              cb(null, test);
            });
          });
        }
      }
    });

    var _seed = util.async.iterator({
      selector: function(test) { return test.seeds; },
      iterator: function(seedSpec, cb) {

        function _seedLocal(seedData, cb) {
          console.log("Seeding local store...", seedData.local);
          // find this in model.js
          seedLocalStore(seedData.local, function(err) {
            if (err) return cb(err);
            cb(null, seedData);
          });
        };

        function _seedRemote(seedData, cb) {
          // TODO: make sure the remote store is cleared
          console.log("Seeding remote store...", seedData.remote);
          // console.log('SEEDDATA', seedData);

          session.client.seed(seedData, function(err, data) {
            if(err) cb(err);
            else cb(null, data)
          });
        };

        util.async([_seedLocal, _seedRemote], seedSpec, cb);
      }
    });

    // TODO: prepare the actions for execution in composer or on hub, respectively
    var funcs = _.map(this.actions, function(action) {
      return function(data, cb) {
        try {
          console.log("####### Test action:", action.label);
          action.func.call(self, data, function(err, data) {
            if (err) self.trigger('action:error', err, action);
            else self.trigger('action:success', null, action);
            cb(err, data);
          });
        } catch(err) {
          self.trigger('action:error', err, action);
          cb(err, data);
        }
      };
    });

    function runActions(data, cb) {
      util.async(funcs, self, cb);
    }

    // Use our simple asynch chaining call
    util.async([_loadSeed, _seed, runActions], self, cb);
  };

  // convenience function to create propagating callbacks instead of needing to define callbacks inline
  this.proceed = util.propagate;

  // initialization
  buildActions();
};


_.extend(Test.prototype, util.Events);

root.Substance.registerTest = function(testSpec) {
  var test = new Test(testSpec);
  // HACK: for now only composer side test execution
  test.env = "composer";
  Substance.tests[testSpec.id] = test;
}

root.Substance.Test = Test;

// registry for all tests
root.Substance.tests = {};

}).call(this);
