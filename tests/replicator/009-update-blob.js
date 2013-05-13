(function(root) {

var test = {};

test.id = 'replicator-009-update-blob';
test.name = 'Replicate an Updated Blob';
test.category = 'Replicator';

test.seeds = [
  {
    requires: "001-boilerplate",
    local: "lorem_ipsum.json",
    remote: "lorem_ipsum.json"
  }
];

var INSERT_IMAGE = [
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

var UPDATED_IMAGE = [
      "update",
      {
        "id": "image:1",
        "data": {
          "medium": "blob2",
          "large": "blob2",
          "caption": "Updated image"
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
    session.document.apply(INSERT_IMAGE);
  },

  "Replicate", function(cb) {
    session.replicate(cb);
  },

  "Update the image", function() {
    session.localStore.createBlob("lorem_ipsum", "blob2", "BASE64_BLOBDATA");
    session.document.apply(UPDATED_IMAGE);
  },

  "Replicate", function(cb) {
    session.replicate(cb);
  },
];

root.Substance.registerTest(test);
})(this);
