(function(root) { "use strict";

// runs a given substance test in vows
var registerTest = function(test) {
  describe(test.path.join("/"), function() {
    describe(test.name, function() {
      it("Setup", test.setup.bind(test));
      for (var idx = 0; idx < test.actions.length; idx++) {
        var action = test.actions[idx];
        it(action.label, action.func.bind(test));
      }
    });
  });
};

module.exports = registerTest;

})(this);
