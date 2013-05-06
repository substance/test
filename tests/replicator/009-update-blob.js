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
      session.document.apply(INSERT_IMAGE);
      cb(null);
    });
  },

  "Replicate", function(data, cb) {
    session.replicate(this.proceed(data, cb));
  },

  "Update the image", function(data, cb) {
    session.createBlob("lorem_ipsum", "blob2", "BASE64_BLOBDATA", function(err) {
      if (err) return cb(err);
      session.document.apply(UPDATED_IMAGE);
      cb(null);
    });
  },

  "Replicate", function(data, cb) {
    session.replicate(cb);
  },
];

Substance.registerTest(test);

