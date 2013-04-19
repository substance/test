var test = new Substance.Test('replicator-001-create-remote');

test.seeds = [
  {
    requires: "001-boilerplate",
    local: "lorem_ipsum.json"
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
  "Document should not exist remotely", function(data, cb) {
    data.remoteStore.exists("lorem_ipsum", function(err, exists) {
      assert.equal(false, exists);
      cb(null, data);
    });
  },
  "Replicate", function(data, cb) {
    data.replicator.sync(Substance.util.propagate(data, cb));
  },
  "Now the document should exist remotely", function(data, cb) {
    data.remoteStore.exists("lorem_ipsum", function(err, exists) {
      assert.equal(true, exists);
      cb(null, data);
    });
  }
];
