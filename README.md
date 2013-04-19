tests
=====

Tests for Substance Hub and Substance Composer

Writing test cases
------------------

An empty test case can be created with

    var test = new Substance.Test();

which needs to be registered globally with

    Substance.tests['some_unique_test_name'] = test;

Test logic is specified as a list of functions such as

    test.actions = [
      "Init the session", function(test, cb) {
        var data = {}
        session.authenticate("oliver", "abcd", Substance.util.propagate(data, cb));
      },
      "Check something", function(data, cb) {
        assert.equal(2, 1+1);
        cb(null, data);
      }
    ];

Additionally, it is possible to add labels as shown above.

Due to the asynchronous nature of the tested APIs the test logic is specified by a chain
to avoid nesting hell. Each action needs to trigger the callback so that execution does continue.
For assertions there is a minimalistic 'API' (only assert.equal and assert.isTrue).

For reusing fixtures, a test case can specify a seed:

    test.seeds = [
      {
        requires: "001-boilerplate",
        remote: "lorem_ipsum.json"
      }
    ];

or,

    test.seeds = ["002-some-docs"];

Seeds
-----

Seeds are of the following format:

    {
      "requires": "<seed-name>",
      "local": "<store-seed-file>",
      "remote": "<store-seed-file>"
    }

"requires" should name another seed directory.
"local" and "remote" are relative paths to dump files of document stores.
