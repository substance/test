"use strict";

var Application = require("substance-application");
var util = require("substance-util");
var TestReport = require("./test_report");
var View = Application.View;
var html = util.html;
var _ = require("underscore");

// DOM Constructor

var $$ = Application.$$;



// Takes a data piece and renders the DOM necessary for the TestCenter
// ==========================================================================


var Renderer = function(data) {
  var fragment = document.createDocumentFragment();

  var testSuites = $$('.test-suites', {
    children: _.map(data.test_suites, function(ts) {
      return $$('a.test-suite.'+ts.name, {
        "sbs-click": "showReport("+ts.name+")",
        "href": "#tests/"+ts.name,
        "text": ts.name,
        "children": [ $$('.status') ]
      })
    })
  });

  fragment.appendChild(testSuites);
  fragment.appendChild($$('.test-report'));
  fragment.appendChild($$('.test-output'));
  return fragment;
};



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

    } else {
      this.currentReport = name;
      that.testRunner.runSuite(name, function(err, report) {
        if (err) console.log(err.stack);
      });
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
    this.el.appendChild(new Renderer({"test_suites": this.testSuites}));
    return this;
  };

  this.dispose = function() {
    this.stopListening();
  };
};

TestCenter.Prototype.prototype = View.prototype;
TestCenter.prototype = new TestCenter.Prototype();

module.exports = TestCenter;
