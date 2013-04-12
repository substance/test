if (typeof Substance == 'undefined') {
  Substance = {};
}



// TODO better naming, better place, maybe there are more custom helpers for asynchronous calls?
function runChain(funcs, data_or_cb, cb) {
  var data = null;

  // be tolerant - allow to omit the data argument
  if (arguments.length == 2) {
    cb = data_or_cb;
  } else if (arguments.length == 3) {
    data = data_or_cb;
  } else {
      throw "Illegal arguments.";
  }

  if (Object.prototype.toString.call(cb) !== '[object Function]') {
    throw "Illegal arguments: a callback function must be provided";
  }

  if (!data) data = {};

  var index = 0;
  var args = [];

  function process(data) {
    var func = funcs[index];
    // stop if no function is left
    if (!func) {
      return cb(null, data);
    }

    // A function that is used as call back for each function
    // which does the progression in the chain via recursion.
    // On errors the given callback will be called and recursion is stopped.
    var recursiveCallback = function(err, data) {
      // stop on error
      if (err) return cb(err, data);

      index += 1;
      process(data);
    };

    func(data, recursiveCallback);
  }

  // start processing
  process(data);
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
  this.seedClient = true;
  this.seedHub = true;

  // usually these get populated using json files
  // however, they can be set manually in test.js, too.
  // The respective data are stored under test.data['composer'] and test.data['hub']
  this.data = {};

  // A list of actions which will be executed in turn.
  // In test specs actions can be defined in a sparse/sloppy way.
  // They get expanded to a unified format automatically.
  this.actions = [];

  this.run = function(cb) {
    // prepare the actions for execution in composer or on hub, respectively
    var funcs = [];

    // TODO: when there are tests for the other platform
    // they need to be converted to stub-tests
    _.each(this.actions, function(action) {
      funcs.push(function(test, cb) {
        action.func(test, cb);
      });
    });

    // use our simple asynch chaining call
    try {
      runChain(funcs, this, cb);
    } catch (err) {
      cb(err, this);
      console.log(err.toString());
    }
  };

};

// registry for all tests
Substance.tests = {};

Substance.loadTestsFromResource = false;

Substance.loadTest = function(testName) {
  // testname should be a relative path to the test directory
  // relative to the tests directory without things like '..'

  function getTest(data, cb) {

    // called when test is available
    function proceed() {
        var test = Substance.tests[testName];
        test.name = testName;
        cb(null, test);
    }

    // TODO: is there another way to retrieve the result of the test spec?
    // Currently, a quasi 'global' variable is used ...
    if (Substance.loadTestsFromResource) {
      $.getScript(testName+"/test.js")
        .done(function() {
            proceed();
          })
        .error(function(request, err) {
            cb(err, null);
          });
    } else {
      proceed();
    }
  }

  // Expands the actions into a unified format.
  // For convenienve, tests maybe be declared in a simpler format.
  function expandActions(test, cb) {
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

  // helper function which is used for creating a function chain
  function resourceGetter(test, fileName, dataKey) {
    return function(data, cb){
      $.getJSON(test.name+"/" + fileName)
       .done(function(data) {
          test.data[dataKey] = data;
          cb(null, test);
        })
       .error(function(req, err) {
          //TODO: create a nicer error message?
          cb(err, test);
        });
    };
  }

  // depending on the test specification
  // more data needs to be loaded
  function loadResources(test, cb) {
    var funcs =  [];

    if (test.seedClient) {
      funcs.push(resourceGetter(test, "composer.json", "composer"));
    }
    if (test.seedHub) {
      funcs.push(resourceGetter(test, "hub.json", "hub"));
    }
    funcs.push(function(data) {
      cb(null, data);
    })
    runChain(funcs, test, cb);
  }

  runChain([getTest, expandActions, loadResources], function(err, test) {
    if (err) {
      console.log("Could not register test: ", testName, "Error:", err);
    } else {
      Substance.tests[testName] = test;
      console.log("Registered test:", test);
    }
  })
};
