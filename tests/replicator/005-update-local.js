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
    var data = {}
    data.replicator = new Substance.Replicator({user: "oliver", store: session.localStore});
    session.authenticate("oliver", "abcd", Substance.util.propagate(data, cb));
  },
  // replicate to register the synch state
  "Replicate", function(data, cb) {
    data.replicator.sync(Substance.util.propagate(data, cb));
  },
  "Update the remote document", function(data, cb) {
    session.remoteStore.delete("lorem_ipsum", Substance.util.propagate(data, cb));
  },
  "Replicate", function(data, cb) {
    data.replicator.sync(Substance.util.propagate(data, cb));
  },
  "Now the document should have been removed locally", function(data, cb) {
    assert.equal(false, session.localStore.exists("lorem_ipsum"));
    cb(null, data);
  }
];

Substance.tests['replicator-003-delete-local'] = test;