var test = {};

test.id = 'replicator-003-delete-local';
test.name = 'Delete Local';
test.category = 'Replicator';

test.seeds = [
  {
    requires: "001-boilerplate",
    local: "lorem_ipsum.json",
    remote: "lorem_ipsum.json"
  }
];

test.actions = [
  "Init the session", function(test, cb) {
    session.authenticate("oliver", "abcd", cb);
  },

  "Document should exist locally", function(data, cb) {
    session.localStore.exists("lorem_ipsum", function(err, exists) {
      assert.equal(true, exists);
      cb(null, data);
    });
  },

  "Initial replication", function(data, cb) {
    session.replicate(this.proceed(data, cb));
  },

  "Delete remote document", function(data, cb) {
    session.remoteStore.delete("lorem_ipsum", this.proceed(data, cb));
  },

  "Replicate", function(data, cb) {
    session.replicate(this.proceed(data, cb));
  },

  "Now the document should have been removed locally", function(data, cb) {
    session.localStore.exists("lorem_ipsum", function(err, exists) {
      assert.equal(false, exists);
      cb(null, data);
    });
  }
];

Substance.registerTest(test);
