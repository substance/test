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
        "path": ['Publishing', 'Publish a version containing blobs']
        "actions": [
          {
            "label": ["Open Doc for editing"],
            "error": {"Some error", "stack_trace": []},
            "duration": 23124,
            "sourcecode": "function(foo) {\nconsole.log('meh'); \n}"
          },
          {
            "label": ["Enter some text"],
            "error": {"Nope", "stack_trace": []},
            "duration": 23124,
            "sourcecode": "function(foo) {\nconsole.log('meh'); \n}"
          }
        ]
      }
    ]
  };

  var TestReport = function(options) {
    Substance.View.call(this);

    // For outgoing events
    // this.session = options.session;
    // this.$el.delegate("#login_form", "submit", _.bind(this.login, this));
  };

  TestReport.Prototype = function() {

    // this.authenticationError = function(err) {
    //   alert('Login failed');
    // };

    this.render = function() {
      this.$el.html(html.renderTemplate('test_report', {}));
      return this;
    };

    this.dispose = function() {
      this.disposeHandlers();
    };
  };

  TestReport.Prototype.prototype = Substance.View.prototype;
  TestReport.prototype = new Testreport.Prototype();

  Substance.TestReport = TestReport;

})(this);