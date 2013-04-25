var test = {}

test.id = '007-replicate-empty-doc';
test.name = 'Replicate Empty Doc';
test.category = 'Replicator';

test.seeds = ['002-some-docs'];

test.actions = [
  "Login", function(test, cb) {
    session.authenticate("michael", "abcd", cb);
  },

  "There should be some documents.", function(test, cb) {
    // Check if there are some docs from the seed
    var docs = session.localStore.list();
    assert.isTrue(docs.length > 0);
    cb(null, docs.length);
  },

  "Create another doc", function(docCount, cb) {
    session.localStore.create('hello');
    assert.equal(docCount+1, session.localStore.list().length);
    cb(null);
  },
  "Push empty doc", function(docCount, cb) {
    session.replicate(cb);
  },
  // "Create empty doc remote", function(docCount, cb) {
  //   session.remoteStore.create('hugo', cb);
  // },
  "Pull empy again", function(docCount, cb) {
    session.replicate(cb);
  }
];

Substance.registerTest(test);
