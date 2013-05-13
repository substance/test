(function(root) {

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
  "Init the session", function(cb) {
    session.authenticate("oliver", "abcd", cb);
  },

  "Document should not exist locally", function() {
    assert.isFalse(session.localStore.exists("lorem_ipsum"));
  },

  "Replicate", function(cb) {
    session.replicate(cb);
  },

  "Now the document should exist locally", function() {
    assert.isTrue(session.localStore.exists("lorem_ipsum"));
  }
];

root.Substance.registerTest(test);
})(this);
