(function(root) {

var test = {};

test.id = 'replicator-004-delete-remote';
test.name = 'Delete Remote';
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

  "Delete local document", function() {
    session.localStore.delete("lorem_ipsum");
  },

  "Replicate", function(cb) {
    session.replicate(cb);
  },

  "Now the document should have been removed remotely", function(cb) {
    session.remoteStore.exists("lorem_ipsum", function(err, exists) {
      assert.isFalse(exists, cb);
      cb(null);
    });
  }
];

root.Substance.registerTest(test);
})(this);
