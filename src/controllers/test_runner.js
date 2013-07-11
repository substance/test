(function(root) {

  var Substance = root.Substance;
  var util = Substance.util;
  var _ = root._;


  // Substance.Test.Runner
  // ================================================
  //
  // A safe interface for interacting with the Substance.Library

  var TestRunner = function(library, options) {


    // Register available test specs
    // _.each(Substance.Test.tests, function(test) {
    //   this.registerTest(test);
    // }, this);

    // Test Registry
    // --------
    // 
    
    this.tests = {};


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


    // Normalize path to get a proper id
    // --------
    // 

    var pathToId = function(path) {
      var id = path.join("_");
      id = id.replace(/[:@/()]/g, "").replace(/\s/g, "_");
      return id;
    };

    // Prepare test based on a test specification
    // --------
    // 

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


    // Prepare test based on a test specification
    // --------
    // 
    
    this.registerTest = function(path, testSpec) {
      var test = this.prepareTest(path, testSpec);
      this.tests[test.id] = test;
    };

    // Handy serialization of test tree
    // --------
    // 

    this.getTestTree = function() {
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
    };
  };

  Substance.Test.Runner = TestRunner;

})(this);
