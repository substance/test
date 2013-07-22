"use strict";

var app = require("substance-application");
var util = require("substance-util");
var TestReport = require("./test_report");
var View = app.View;
var html = util.html;

// Substance.TestCenter
// ==========================================================================

var TestCenter = function(testRunner, options) {
  View.call(this);

  this.testRunner = testRunner;

  // Test reports are collected here
  this.reports = {};

  this.$el.addClass('test-center');

  this.testSuites = this.testRunner.getTestSuites();

  // Set requested report or use the first one
  this.currentReport = options.report || _.pluck(this.testSuites, 'name')[0];

  // For outgoing events
  this.listenTo(this.testRunner, 'report:ready', this.onReportReady);
};

TestCenter.Prototype = function() {

  // Show a particular report
  // --------
  //

  this.showReport = function(name) {
    var report = this.reports[name];
    var that = this;
    if (report) {
      this.currentReport = report;
      if (this.reportView) this.reportView.dispose();
      this.reportView = new TestReport(report);
      this.$('.test-report').html(this.reportView.render().el);

      // Set active flag
      this.$('.test-suite').removeClass('active');
      this.$('.test-suite.'+name).addClass('active');

      // FIXME:
      window.Substance.router.navigate('tests/'+name);
    } else {
      this.currentReport = name;
      that.testRunner.runSuite(name);
    }
  };

  // Received report
  // --------
  //

  this.onReportReady = function(suiteName, report) {
    this.reports[suiteName] = report;
    this.registerReport(report);

    if (this.currentReport === suiteName) {
      this.showReport(suiteName);
    }
  };

  // Registers a report
  // --------
  //
  // onReportReady

  this.registerReport = function(report) {
    this.$('.test-suite.'+report.name+' .status').addClass(report.error ? "error" : "success");
  };

  // Render it
  // --------
  //

  this.render = function() {
    this.$el.html(html.renderTemplate('test_center', {
      "test_suites": this.testSuites
    }));
    return this;
  };

  this.dispose = function() {
    this.stopListening();
  };
};

TestCenter.Prototype.prototype = View.prototype;
TestCenter.prototype = new TestCenter.Prototype();

module.exports = TestCenter;
