"use strict";

var Test = require('./src/test');
Test.assert = require('./src/assert');
Test.Runner = require('./src/controllers/test_runner');
Test.MochaRunner = require('./src/controllers/mocha_test_runner');
Test.TestCenter = require('./src/views/test_center');
Test.TestReport = require('./src/views/test_report');

module.exports = Test;
