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

    // Test reports are collected here
    this.reports = {};

    this.$el.addClass('test-center');

    this.currentReport = null;

    // For outgoing events
    this.listenTo(this.testRunner, 'report:ready', this.onReportReady);

    var showReport = this.showReport;
  };

  TestCenter.Prototype = function() {

    // Show a particular report
    // --------
    //

    this.showReport = function(name) {
      var report = this.reports[name];

      if (report) {
        this.currentReport = report;
        if (this.reportView) this.reportView.dispose();
        this.reportView = new TestReport(report);
        this.$('.test-report').html(this.reportView.render().el);

        // Set active flag
        this.$('.test-suite').removeClass('active');
        this.$('.test-suite.'+name).addClass('active');
      } else {
        console.log('report', name, 'not ready');
      }
    };

    // Received report
    // --------
    //

    this.onReportReady = function(suiteName, report) {
      this.reports[suiteName] = report;
      console.log('report ready!');
      this.showReport(suiteName);
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