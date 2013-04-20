var test = new Substance.Test('replicator-003-delete-local');

test.seeds = [
  {
    requires: "001-boilerplate",
    local: "lorem_ipsum.json",
    remote: "lorem_ipsum.json"
  }
];

test.actions = [
  "Init the session", function(test, cb) {
    session.authenticate("oliver", "abcd", function(err) {
      if (err) return cb(err);
      var data = {};
      data.localStore = session.localStore;
      data.remoteStore = session.remoteStore;
      data.replicator = new Substance.Replicator({user: "oliver", store: data.localStore});
      cb(null, data);
    });
  },

  "Document should exist locally", function(data, cb) {
    data.localStore.exists("lorem_ipsum", function(err, exists) {
      assert.equal(true, exists);
      cb(null, data);
    });
  },

  "Initial replication", function(data, cb) {
    data.replicator.sync(test.proceed(data, cb));
  },

  "Delete remote document", function(data, cb) {
    session.remoteStore.delete("lorem_ipsum", test.proceed(data, cb));
  },

  "Replicate", function(data, cb) {
    data.replicator.sync(test.proceed(data, cb));
  },

  "Now the document should have been removed locally", function(data, cb) {
    data.localStore.exists("lorem_ipsum", function(err, exists) {
      assert.equal(false, exists);
      cb(null, data);
    });
  }
];
