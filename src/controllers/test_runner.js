(function(root) {


  var _,
      util,
      Test;

  if (typeof exports !== 'undefined') {
    _ = require('underscore');
    util = require('substance-util');
    Test = require('../test');
  } else {
    _ = root._;
    util = root.Substance.util;
    Test = root.Substance.Test;
  }

  // Expands the actions into a unified format.
  // --------
  //
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

  // Substance.Test.Runner
  // ================================================
  //

  var TestRunner = function() {
    this.tests = {};

    // Collects test reports
    this.reports = {};

    // Prepare test based on a test specification
    // --------
    //

    var createTest = function(testSpec) {
      var test = new Test();

      // add everything from the testSpec
      _.extend(test, testSpec);

      // name, path, and actions have to be normalized

      // the last entry of the path is taken as name
      test.name = _.last(testSpec.path);
      test.path = testSpec.path.slice(0, testSpec.path.length-1);

      // A list of actions which will be executed in turn.
      // In test specs actions can be defined in a sparse/sloppy way.
      // They get expanded to a unified format automatically.
      test.actions = compileActions(testSpec);

      return test;
    };


    // Prepare test based on a test specification
    // --------
    //

    this.loadTests = function() {
      _.each(Test.testSpecs, function(testSpec) {
        var test = createTest(testSpec);
        this.tests[test.id] = test;
      }, this);
    };

    // Handy serialization of test tree
    // --------
    //

    // this.getTestTree = function() {
    //   var tree = {};

    //   _.each(this.tests, function(test) {
    //     var obj = tree;
    //     var subpath = [];
    //     _.each(test.path, function(key) {
    //       subpath.push(key);
    //       if(!obj[key]) {
    //         obj[key] = {
    //           id: test.id,
    //           name: key
    //         };
    //       }
    //       obj = obj[key];
    //     });
    //     obj[test.name] = test;
    //   });
    //   return tree;
    // };



    this.getTestSuites = function() {
      var suites = {};

      _.each(this.tests, function(test) {
        var suiteName = test.path[0];

        suites[suiteName] = suites[suiteName] || {
          name: suiteName,
          tests: []
        };
        suites[suiteName].tests.push(test);
      });

      return suites;
    };

    // suiteName is optional
    // --------
    //
    // TODO: currently only supports one suiteName

    this.runSuite = function(suiteName, cb) {
      var that = this;
      var suites = this.getTestSuites();
      var suite = suites[suiteName];

      var funcs = _.map(suite.tests, function(t) {
        return t.run.bind(t);
      });

      util.async.sequential({
        functions: funcs,
      }, function(err, report) {
        console.log('REPORT', report);
        that.reports[suiteName] = report;
        that.trigger('report:ready', suiteName);
        cb(err, report);
      });
    };

    this.loadTests();
  };

  TestRunner.prototype = util.Events;

  if (typeof exports !== 'undefined') {
    module.exports = TestRunner;
  } else {
    root.Substance.Test.Runner = TestRunner;
  }

})(this);
