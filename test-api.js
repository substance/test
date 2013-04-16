if (typeof Substance == 'undefined') {
  Substance = {};
}

// for now only these two functions.
// if necessary we could pull in something more sophisticated such as chai.js
var assert = {};

assert.AssertionError = function (message) {
  this.message = message;
  try { throw new Error(); } catch (trace) {
    var idx;
    var stackTrace = trace.stack.split('\n');
    // parse the stack trace: each line is a tuple (function, file, lineNumber)
    // TODO: is this interpreter specific?
    // for safari it is "<function>@<file>:<lineNumber>"
    var expr = /([^@]*)@(.*):(\d+)/;

    var stack = [];
    for (idx = 0; idx < stackTrace.length; idx++) {
      var match = expr.exec(stackTrace[idx]);
      if (match) {
        var entry = {
          func: match[1],
          file: match[2],
          line: match[3]
        };
        if (entry.func === "") entry.func = "<anonymous>";
        stack.push(entry);
      }
    }

    // leave out the first entries that are from this file
    var thisFile = stack[0].file;
    for (idx = 1; idx < stack.length; idx++) {
      if (stack[idx].file !== thisFile) break;
    }
    this.stack = stack.slice(idx);
  }
};

assert.AssertionError.prototype = new Error();
assert.AssertionError.prototype.constructor = assert.AssertionError;
assert.AssertionError.prototype.name = 'AssertionError';

assert.AssertionError.prototype.toString = function() {
  var errorPos = this.stack[0];
  return this.message + " at " + errorPos.file+":"+errorPos.line;
};

assert.equal = function(expected, actual) {
  if (expected !== actual) {
    var err = "Assertion failed. Expected="+expected+", actual="+actual;
    var exc = new assert.AssertionError(err);
    var bla = new Error();
    throw exc;
  }
}

assert.isTrue = function(stmt) {
  assert.equal(true, stmt);
};

assert.isNull = function(stmt) {
  assert.isTrue(stmt === null);
};

Substance.Test = function() {
  var self = this;

  // will be set automatically when registering a test
  this.name = "";

  // default type of a Test is composer-only
  this.defaultType = 'composer';

  // Variables to control whether additional resources will be loaded.
  // If seedClient is set to true, `composer.json` should be present.
  // If seedHub is set to true, `hub.json` should be present.
  // Both values are by default true.
  // this.seedClient = true;
  // this.seedHub = true;

  // usually these get populated using json files
  // however, they can be set manually in test.js, too.
  // The respective data are stored under test.data['composer'] and test.data['hub']
  this.data = {};

  // A list of actions which will be executed in turn.
  // In test specs actions can be defined in a sparse/sloppy way.
  // They get expanded to a unified format automatically.
  this.actions = [];

  this.run = function(cb) {

    var oldEnv;

    var prepare = Substance.util.async.each({
      selector: function(test) { return test.seeds; },
      iterator: function(seedSpec, cb) {

        var funcs = [];

        funcs.push(Substance.util.loadSeed);

        funcs.push(function(seedData, cb) {
          console.log("Seeding local store...", seedData.local);
          // find this in model.js
          Substance.test.seed(seedData.local, function(err) {
            if (err) return cb(err);
            cb(null, seedData);
          });
        });

        funcs.push(function(seedData, cb) {
          // TODO: make sure the remote store is cleared
          console.log("Seeding remote store...", seedData.remote);
          client.seed(seedData, cb);
        });

        Substance.util.async(funcs, seedSpec, cb);
      }
    });

    // TODO: prepare the actions for execution in composer or on hub, respectively
    var funcs = _.map(this.actions, function(action) {
      return function(data, cb) {
        action.func(data, cb);
      };
    });

    // use our simple asynch chaining call
    prepare(this, function(err) {
      if (err) return cb(err);
      var oldEnv = Substance.env;
      Substance.env = "test";
      Substance.util.async(funcs, self, function(err, data) {
        Substance.env = oldEnv;
        cb(err, data);
      });
    });
  };

};

// registry for all tests
Substance.tests = {};

// testname should be a relative path to the test directory
// relative to the tests directory without things like '..'
Substance.loadTest = function(testName, env) {
  console.log("Loading test...", testName);

  // TODO: the API will be later used from withing Composer and from Hub.
  var util = Substance.util;

  function getTest(data, cb) {
    var test = Substance.tests[testName];
    test.name = testName;
    test.env = env;
    cb(null, test);
  }

  var loadSeeds = util.async.each({
    selector: function(test) { return test.seeds; },
    iterator: function(seedName_or_inlineSeed, idx, test, cb) {
      console.log("load seed...");
      // do not load a seed if it is defined inline or has been loaded already
      var isInline = !util.isString(seedName_or_inlineSeed);
      if (isInline) {
        var seedSpec = seedName_or_inlineSeed;
        util.prepareSeedSpec(seedSpec, function(err, seed) {
          if (err) return cb(err);
          test.seeds[idx] = seed;
          cb(null, test);
        });
      } else {
        util.loadSeedSpec(seedName_or_inlineSeed, function(err, seed) {
          if (err) return cb(err);
          test.seeds[idx] = seed;
          cb(null, test);
        });
      }
    }
  });

  // Expands the actions into a unified format.
  // For convenienve, tests maybe be declared in a simpler format.
  function expandActions(test, cb) {
    console.log("expand actions...");
    var _actions = []
    _.each(test.actions, function(action) {
      var _action = {
        'label': null,
        'type': test.defaultType,
        'func': null
      };
      var objType = Object.prototype.toString.call(action);
      // actions can be declared in a declarative way in array notation
      // e.g.: ['Label', 'composer', function(test, cb) {...}]
      // 'composer' and 'hub' are keywords to specify the action type
      if(objType === '[object Array]') {
        _.each(action, function(elem) {
          var elemType = Object.prototype.toString.call(elem);
          // String elements can be either platform type or a label
          if (elemType === '[object String]') {
            if (elem === 'composer' || elem === 'hub') {
              _action.type = elem;
            } else {
              _action.label = elem;
            }
          // a function element is the action body
          } else if (elemType === '[object Function]') {
            _action.func = elem;
          // other things not allowed
          } else {
            cb("Illegal action format.", null);
          }
        })
      }
      // alternatively, only the action body can be given
      else if (objType === '[object Function]') {
        _action.func = action;
      }
      // and also a direct version as object
      else {
        if (action.func) _action.func = action.func;
        if (action.label) _action.label = action.label;
        if (action.type) _action.type = action.type;
      }
      _actions.push(_action);
    });
    test.actions = _actions;

    cb(null, test);
  }

  Substance.util.async([getTest, loadSeeds, expandActions], function(err, test) {
    if (err) {
      console.log("Could not register test: ", testName, "Error:", err);
    } else {
      Substance.tests[testName] = test;
      console.log("Registered test:", test);
    }
  })
};

