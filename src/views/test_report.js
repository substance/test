"use strict";

var app = require("substance-application");
var util = require("substance-util");
var View = app.View;
var html = util.html;

// Substance.TestReport
// ==========================================================================


var TestReport = function(report) {
  View.call(this);

  this.report = report;

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

TestReport.Prototype.prototype = View.prototype;
TestReport.prototype = new TestReport.Prototype();

module.exports = TestReport;
