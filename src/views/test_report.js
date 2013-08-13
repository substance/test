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
};

TestReport.Prototype = function() {

  // Render it
  // --------

  this.render = function() {
    this.$el.html(html.tpl('test_report', this.report));
    return this;
  };

  this.dispose = function() {
    this.stopListening();
  };
};

TestReport.Prototype.prototype = View.prototype;
TestReport.prototype = new TestReport.Prototype();

module.exports = TestReport;
