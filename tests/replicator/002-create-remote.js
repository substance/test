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
  "Init the session", function(test, cb) {
    session.authenticate("oliver", "abcd", cb);
  },
  "Document should not exist remotely", function(data, cb) {
    session.remoteStore.exists("lorem_ipsum", function(err, exists) {
      assert.equal(false, exists);
      cb(null, data);
    });
  },
  "Replicate", function(data, cb) {
    session.replicate(this.proceed(data, cb));
  },
  "Now the document should exist remotely", function(data, cb) {
    session.remoteStore.exists("lorem_ipsum", function(err, exists) {
      assert.equal(true, exists);
      cb(null, data);
    });
  }
];

Substance.registerTest(test);
