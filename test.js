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

  // convenience method for boolean assertions
  this.assertTrue = function(stmt, cb) {
    if (!stmt) {
      var err = "Assertion failed.";
      cb(err, null);
      throw err;
    }
  };

  // convenience method for euality assertions
  this.assertEqual = function(expected, actual, cb) {
    if (expected !== actual ) {
      var err = "Assertion failed: expected="+expected+", actual="+actual;
      cb(err, null);
      throw err;
    }
  }

  this.run = function(cb) {
    // prepare the actions for execution in composer or on hub, respectively
    var funcs = [];
    //TODO do preparation, i.e., unpack the
    _.each(this.actions, function(action) {
      funcs.push(function(test, cb) {
        action.func(test, cb);
        // TODO: we could add the last cb(null, test) call
        //  which is questionable, though.
        cb(null, test);
      });
    });

    // use our simple asynch chaining call
    try {
      runChain(funcs, this, cb);
    } catch (err) {
      // not repeating the message, as cb has been called already
    }
  };

};

// registry for all tests
Substance.tests = {};

Substance.loadTest = function(testName) {
  // testname should be a relative path to the test directory
  // relative to the tests directory without things like '..'
  Substance.test = new Substance.Test();

  function getTest(data, cb) {
    // TODO: is there another way to retrieve the result of the test spec?
    // Currently, a quasi 'global' variable is used ...
    Substance.test = new Substance.Test();
    $.getScript(testName+"/test.js")
      .done(function() {
          var test = Substance.test;
          test.name = testName;
          cb(null, test);
        })
      .error(function(request, err) {
          cb(err, null);
        });
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
