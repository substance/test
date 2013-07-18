(function(root) { "use strict";

  var _ = root._;
  var Substance = root.Substance;
  var View = Substance.Application.View;
  var util = Substance.util;
  var html = Substance.util.html;
  var TestReport = Substance.TestReport;

  // Substance.TestCenter
  // ==========================================================================

  var TestCenter = function(testRunner) {
    View.call(this);

    this.testRunner = testRunner;

    this.$el.addClass('test-center');

    // For outgoing events
    // this.session = options.session;
    // this.$el.delegate("#login_form", "submit", _.bind(this.login, this));
    this.listenTo(this.testRunner, 'report:ready', this.openReport);
  };

  TestCenter.Prototype = function() {

    // Open a new test report
    // --------
    //

    this.openReport = function(suiteName, report) {
      if (this.reportView) this.reportView.dispose();
      this.reportView = new TestReport(report);
      this.$('.test-report').html(this.reportView.render().el);
    };

    // Render it
    // --------
    //

    this.render = function() {
      var testSuites = this.testRunner.getTestSuites();

      // TODO: Use this.testRunner for the view
      this.$el.html(html.renderTemplate('test_center', {
        test_suites: testSuites
      }));

      return this;
    };

    this.dispose = function() {
      this.stopListening();
    };
  };

  TestCenter.Prototype.prototype = View.prototype;
  TestCenter.prototype = new TestCenter.Prototype();

  Substance.TestCenter = TestCenter;

})(this);