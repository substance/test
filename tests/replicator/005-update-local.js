var test = new Substance.Test();

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
  // replicate to register the synch state
  "Replicate", function(data, cb) {
    data.replicator.sync(Substance.util.propagate(data, cb));
  },
  "Update the remote document", function(data, cb) {
    data.remoteStore.delete("lorem_ipsum", Substance.util.propagate(data, cb));
  },
  "Replicate", function(data, cb) {
    data.replicator.sync(Substance.util.propagate(data, cb));
  },
  "Now the document should have been removed locally", function(data, cb) {
    data.localStore.exists("lorem_ipsum", function(err, exists) {
      if (err) return cb(err);
      assert.equal(false, exists);
      cb(null, data);
    });
  }
];

Substance.tests['replicator-003-delete-local'] = test;