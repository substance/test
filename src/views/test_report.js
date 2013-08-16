"use strict";

var app = require("substance-application");
var util = require("substance-util");
var View = app.View;
var Application = require("substance-application");
var html = util.html;

var $$ = Application.$$;

var Renderer = function(data) {


  // A lil template helper
  // --------

  function actions(actions) {
    return _.map(actions, function(a, index) {

      var childs = [];

      if (a.error) {
        childs.push($$('.error-message', {text: a.error.message }));
        childs.push($$('.error-source', {children: [$$('pre', {text: a.sourcecode})]}));
        childs.push($$('.stack-trace', {children: [$$('pre', {text: a.error.stack})]}));
      }

      childs.push($$('.duration', {text: a.duration+" ms"}));

      // Return the container + content
      return $$('div.action.'+( a.error ? 'error' : 'success'), {
        text: [index, a.label].join(' '),
        children: childs
      });
    })
  }

  var tests = $$('.tests', {
    children: _.map(data.tests, function(test) {
      return $$('.test', {
        children: [
          $$('.div.name', { text: data.name }),
          $$('.actions', {
            children: actions(test.actions)
          })
        ]
      })
    })
  });

  var frag = document.createDocumentFragment();
  frag.appendChild($$('.border-right'));
  frag.appendChild($$('h2', {text: data.name}));
  frag.appendChild(tests);

  return frag;
}


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
    this.el.appendChild(new Renderer(this.report));
    return this;
  };

  this.dispose = function() {
    this.stopListening();
  };
};

TestReport.Prototype.prototype = View.prototype;
TestReport.prototype = new TestReport.Prototype();

module.exports = TestReport;
