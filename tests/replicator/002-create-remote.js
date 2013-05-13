(function(root) {

var test = {};

test.id = 'replicator-001-create-remote';
test.name= 'Create Remote';
test.category = 'Replicator';

test.seeds = [
  {
    requires: "001-boilerplate",
    local: "lorem_ipsum.json"
  }
];

test.actions = [
  "Init the session", function(cb) {
    session.authenticate("oliver", "abcd", cb);
  },

  "Document should not exist remotely", function(cb) {
    session.remoteStore.exists("lorem_ipsum", function(err, exists) {
      assert.isFalse(exists, cb);
      cb(null);
    });
  },

  "Replicate", function(cb) {
    session.replicate(cb);
  },

  "Now the document should exist remotely", function(cb) {
    session.remoteStore.exists("lorem_ipsum", function(err, exists) {
      assert.isTrue(exists, cb);
      cb(null);
    });
  }
];

root.Substance.registerTest(test);
})(this);
