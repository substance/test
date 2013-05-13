(function(root) {

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
  "Init the session", function(cb) {
    session.authenticate("oliver", "abcd", cb);
  },

  "Initial replication", function(cb) {
    session.replicate(cb);
  },

  "Load document", function() {
    session.loadDocument("lorem_ipsum");
  },

  "Add a blob with commit locally", function() {
    session.localStore.createBlob("lorem_ipsum", "blob1", "BASE64_BLOBDATA");
    session.document.apply(OP);
  },

  "Replicate", function(cb) {
    session.replicate(cb);
  },

  "Now the remote store should contain the blob", function(cb) {
    session.remoteStore.getBlob("lorem_ipsum", "blob1", function(err, blob) {
      assert.notNull(blob, cb);
      cb(err);
    });
  }
];

root.Substance.registerTest(test);
})(this);
