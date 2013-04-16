var test = new Substance.Test();

test.seeds = [
  {
    requires: "001-boilerplate",
    remote: "lorem_ipsum.json"
  }
];

test.actions = [
  ["Init the session", function(test, cb) {
    var data = {}
    data.replicator = new Substance.Replicator({user: "oliver", store: session.localStore});
    session.authenticate("oliver", "abcd", Substance.util.propagate(data, cb));
  }],
  ["Document should not exist locally", function(data, cb) {
    assert.equal(false, session.localStore.exists("lorem_ipsum"));
    cb(null, data);
  }],
  ["Replicate", function(data, cb) {
    data.replicator.sync(Substance.util.propagate(data, cb));
  }],
  ["Now the document should exist locally", function(data, cb) {
    assert.equal(true, session.localStore.exists("lorem_ipsum"));
    cb(null, data);
  }]
];

Substance.tests['replicator_001-create-local'] = test;
