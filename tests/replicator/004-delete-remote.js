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
  "Init the session", function(test, cb) {
    session.authenticate("oliver", "abcd", function(err) {
      if (err) return cb(err);
      var data = {};
      data.localStore = session.localStore;
      data.remoteStore = session.remoteStore;
      cb(null, data);
    });
  },

  "Initial replication", function(data, cb) {
    session.replicate(this.proceed(data, cb));
  },

  "Delete local document", function(data, cb) {
    data.localStore.delete("lorem_ipsum", this.proceed(data, cb));
  },

  "Replicate", function(data, cb) {
    session.replicate(this.proceed(data, cb));
  },

  "Now the document should have been removed remotely", function(data, cb) {
    data.remoteStore.exists("lorem_ipsum", function(err, exists) {
      assert.equal(false, exists);
      cb(null, data);
    });
  }
];

Substance.registerTest(test);