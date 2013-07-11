(function(root) { "use_strict";

  var _ = root._;
  var Substance = root.Substance;
  var util = Substance.util;
  var html = Substance.util.html;

  // Substance.TestCenter
  // ==========================================================================

  var TestCenter = function(testRunner) {
    Substance.View.call(this);

    this.testRunner = testRunner;

    // For outgoing events
    // this.session = options.session;
    // this.$el.delegate("#login_form", "submit", _.bind(this.login, this));
    this.handle(this.testRunner, 'state-changed:open-report', this.openReport)
  };

  TestCenter.Prototype = function() {

    this.render = function() {
      this.$el.html(html.renderTemplate('test_center', {
        test_suites: [
          {"name": "store"},
          {"name": "library"}
        ]
      }));
      return this;
    };

    this.

    this.dispose = function() {
      this.disposeHandlers();
    };
  };

  TestCenter.Prototype.prototype = Substance.View.prototype;
  TestCenter.prototype = new TestCenter.Prototype();

  Substance.TestCenter = TestCenter;

})(this);