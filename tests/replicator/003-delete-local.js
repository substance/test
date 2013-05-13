(function(root) {

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
  "Init the session", function(cb) {
    session.authenticate("oliver", "abcd", cb);
  },

  "Initial replication", function(cb) {
    session.replicate(cb);
  },

  "Delete remote document", function(cb) {
    session.remoteStore.delete("lorem_ipsum", cb);
  },

  "Replicate", function(cb) {
    session.replicate(cb);
  },

  "Now the document should have been removed locally", function() {
    assert.isFalse(session.localStore.exists("lorem_ipsum"));
  }
];

root.Substance.registerTest(test);
})(this);
