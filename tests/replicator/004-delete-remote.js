var test = new Substance.Test('replicator-004-delete-remote');

test.seeds = [
  {
    requires: "001-boilerplate",
    local: "lorem_ipsum.json",
    remote: "lorem_ipsum.json"
  }
];

test.actions = [
  "Init the session", function(test, cb) {
    session.authenticate("oliver", "abcd", function(err, _) {
      if (err) return cb(err);
      var data = {}
      data.localStore = session.localStore;
      data.remoteStore = session.remoteStore;
      data.replicator = new Substance.Replicator({user: "oliver", store: data.localStore});
      cb(null, data);
    });
  },
  "Document should exist remotely", function(data, cb) {
    data.remoteStore.exists("lorem_ipsum", function(err, exists) {
      if (err) return cb(err);
      assert.equal(true, exists);
      cb(null, data);
    });
  },
  // replicate, just to register the synch state
  "Replicate", function(data, cb) {
    data.replicator.sync(Substance.util.propagate(data, cb));
  },
  "Delete local document", function(data, cb) {
    data.localStore.delete("lorem_ipsum", Substance.util.propagate(data, cb));
  },
  "Replicate", function(data, cb) {
    data.replicator.sync(Substance.util.propagate(data, cb));
  },
  "Now the document should have been removed remotely", function(data, cb) {
    data.remoteStore.exists("lorem_ipsum", function(err, exists) {
      if (err) return cb(err);
      assert.equal(false, exists);
      cb(null, data);
    });
  }
];
