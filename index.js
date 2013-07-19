"use strict";

var Test = require('./src/test');

module.exports = {
  assert: require('./src/assert'),
  Test: Test,
  registerTest: Test.registerTest,
  TestRunner: require('./src/controllers/test_runner'),
  MochaTestRunner: require('./src/controllers/mocha_test_runner'),
  TestAction: require('./src/views/test_action'),
  TestCenter: require('./src/views/test_center'),
  TestReport: require('./src/views/test_report')
};
