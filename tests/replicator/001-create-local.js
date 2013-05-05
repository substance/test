var test = {};

test.id = 'replicator-001-create-local';
test.name = 'Create Local';
test.category = 'Replicator';

test.seeds = [
  {
    requires: "001-boilerplate",
    remote: "lorem_ipsum.json"
  }
];

test.actions = [
  "Init the session", function(test, cb) {
    session.authenticate("oliver", "abcd", cb);
  },

  "Document should not exist locally", function(data, cb) {
    session.localStore.exists("lorem_ipsum", function(err, exists) {
      assert.equal(false, exists);
      cb(null, data);
    });
  },

  "Replicate", function(data, cb) {
    session.replicate(this.proceed(data, cb));
  },

  "Now the document should exist locally", function(data, cb) {
    session.localStore.exists("lorem_ipsum", function(err, exists) {
      if (err) return cb(err);
      assert.equal(true, exists);
      cb(null, data);
    });
  }
];

Substance.registerTest(test);
