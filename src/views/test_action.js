(function(root) { "use_strict";

  var _ = root._;
  var Substance = root.Substance;
  var util = Substance.util;

  // Substance.TestReport
  // ==========================================================================

  var TEST_REPORT = {
    "label": ["Enter some text"],
    "error": {"Nope", "stack_trace": []},
    "duration": 23124,
    "sourcecode": "function(foo) {\nconsole.log('meh'); \n}"
  };

  var TestAction = function(options) {
    Substance.View.call(this);

    // For outgoing events
    // this.session = options.session;
    // this.$el.delegate("#login_form", "submit", _.bind(this.login, this));
  };

  TestAction.Prototype = function() {

    // this.authenticationError = function(err) {
    //   alert('Login failed');
    // };

    this.render = function() {
      var that = this;
      this.$el.html("HELLO FROM THE TEST CENTRE");
      
      return this;
    };

    this.dispose = function() {
      this.disposeHandlers();
    };
  };

  TestAction.Prototype.prototype = Substance.View.prototype;
  TestAction.prototype = new Testreport.Prototype();

  Substance.TestAction = TestAction;

})(this);