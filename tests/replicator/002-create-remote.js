var test = new Substance.Test();

test.seeds = [
  {
    requires: "001-boilerplate",
    local: "lorem_ipsum.json"
  }
];

test.actions = [
  ["Init the session", function(test, cb) {
    var data = {}
    data.replicator = new Substance.Replicator({user: "oliver", store: session.localStore});
    session.authenticate("oliver", "abcd", Substance.util.propagate(data, cb));
  }],
  ["Document should not exist remotely", function(data, cb) {
    session.remoteStore.exists("lorem_ipsum", function(err, exists) {
      assert.equal(false, exists);
      cb(null, data);
    });
  }],
  ["Replicate", function(data, cb) {
    data.replicator.sync(Substance.util.propagate(data, cb));
  }],
  ["Now the document should exist remotely", function(data, cb) {
    session.remoteStore.exists("lorem_ipsum", function(err, exists) {
      assert.equal(true, exists);
      cb(null, data);
    });
  }]
];

Substance.tests['replicator_001-create-remote'] = test;
