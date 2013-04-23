var test = {}

test.id = '001-hello-world';
test.name = 'Hello World';
test.category = 'General';

test.seeds = ['002-some-docs'];

test.actions = [
  "Login", function(test, cb) {
    session.authenticate("michael", "abcd", cb);
  },

  "There should be some douments.", function(test, cb) {
    // Check if there are some docs from the seed
    var docs = session.localStore.list();
    assert.isTrue(docs.length > 0);

    cb(null, docs.length);
  },

  "Create another doc", function(docCount, cb) {
    session.localStore.create('hello');
    assert.equal(docCount+1, session.localStore.list().length);
    cb(null);
  }
];

Substance.registerTest(test);
