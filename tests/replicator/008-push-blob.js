var test = {};

test.id = 'replicator-008-push-blob';
test.name = 'Push Blob';
test.category = 'Replicator';

test.seeds = [
  {
    requires: "001-boilerplate",
    local: "lorem_ipsum.json",
    remote: "lorem_ipsum.json"
  }
];


var OP = [
      "insert",
      {
        "id": "image:1",
        "type": "image",
        "target": "back",
        "data": {
          "medium": "blob1",
          "large": "blob1",
          "caption": "A new image"
        }
      }
     ];

test.actions = [
  "Init the session", function(test, cb) {
    session.authenticate("oliver", "abcd", cb);
  },

  "Initial replication", function(data, cb) {
    session.replicate(this.proceed(data, cb));
  },

  "Load document", function(data, cb) {
    session.loadDocument("lorem_ipsum", cb);
  },

  "Add a blob with commit locally", function(data, cb) {
    session.createBlob("lorem_ipsum", "blob1", "BASE64_BLOBDATA", function(err) {
      if (err) return cb(err);
      session.document.apply(OP);
      cb(null);
    });
  },

  "Replicate", function(data, cb) {
    session.replicate(this.proceed(data, cb));
  },

  "Now the remote store should contain the blob", function(data, cb) {
    session.remoteStore.getBlob("lorem_ipsum", "blob1", function(err, blob) {
      assert.notNull(blob);
      cb(err);
    });
  }
];

Substance.registerTest(test);

