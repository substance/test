(function(root) { "use strict";

  var _ = root._;
  var Substance = root.Substance;
  var View = Substance.Application.View;
  var util = Substance.util;
  var html = Substance.util.html;

  // Substance.TestReport
  // ==========================================================================


  var TestReport = function(report) {
    View.call(this);

    this.report = report;

  };

  TestReport.Prototype = function() {

    // Render it
    // --------

    this.render = function() {
      this.$el.html(html.renderTemplate('test_report', this.report));
      return this;
    };

    this.dispose = function() {
      this.stopListening();
    };
  };

  TestReport.Prototype.prototype = View.prototype;
  TestReport.prototype = new TestReport.Prototype();

  Substance.TestReport = TestReport;

})(this);