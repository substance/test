(function(root) { "use_strict";

  var _ = root._;
  var Substance = root.Substance;
  var util = Substance.util;
  var html = Substance.util.html;

  // Substance.TestReport
  // ==========================================================================

  var TEST_REPORT = {
    "tests": [
      {
        "path": ['Publishing', 'Publish a version containing blobs'],
        "actions": [
          {
            "label": ["Open Doc for editing"],
            "error": {"message": "Some error", "stack_trace": []},
            "duration": 23124,
            "sourcecode": "function(foo) {\nconsole.log('meh'); \n}"
          },
          {
            "label": ["Enter some text"],
            "error": {"message": "Nope", "stack_trace": []},
            "duration": 23124,
            "sourcecode": "function(foo) {\nconsole.log('meh'); \n}"
          }
        ]
      }
    ]
  };

  var TestReport = function(report) {
    Substance.View.call(this);
    
    // this.report = report;
    this.report = TEST_REPORT;

    // Dom Events
    // this.$el.delegate("#login_form", "submit", _.bind(this.login, this));
  };

  TestReport.Prototype = function() {

    // Render it
    // --------

    this.render = function() {
      this.$el.html(html.renderTemplate('test_report', this.report));
      return this;
    };

    this.dispose = function() {
      this.disposeHandlers();
    };
  };

  TestReport.Prototype.prototype = Substance.View.prototype;
  TestReport.prototype = new TestReport.Prototype();

  Substance.TestReport = TestReport;

})(this);