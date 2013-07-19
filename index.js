"use strict";

var Test = require('./src/test');
Test.assert = require('./src/assert');
Test.Runner = require('./src/controllers/test_runner');
Test.MochaRunner = require('./src/controllers/mocha_test_runner');
Test.View = {};
Test.View.TestAction = require('./src/views/test_action');
Test.View.TestCenter = require('./src/views/test_center');
Test.View.TestReport = require('./src/views/test_report');

module.exports = Test;
