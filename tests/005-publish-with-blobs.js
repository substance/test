var test = {};

test.id = '005-publish-with-blobs';
test.name = 'Publish a version containing blobs';
test.category = '';

test.seeds = ['002-some-docs'];

test.actions = [
  "Login", function(test, cb) {
    session.authenticate("michael", "abcd", cb);
  },

  "Open Doc for editing", function(data, cb) {
    session.loadDocument("test-doc-michael-1", cb);
  },

  "Create a new blob locally", function(data, cb) {
    session.createBlob("test-doc-michael-1", "image:1", "BASE64_BLOBDATA", cb);
  },

  "Create a new image locally", function(data, cb) {
    var op = [
      "insert",
      {
        "id": "image:abcd",
        "type": "image",
        "target": "back",
        "data": {
          "medium": "image:1",
          "large": "image:1",
          "caption": "A new image"
        }
      }
    ];

    session.document.apply(op);
    cb(null);
  },

  // TODO: try to create version before publication. Ensure this properly fails
  // Creating a publication implicitly creates a document entry on the hub
  "Create publication", function(doc, cb) {
    session.createPublication("substance", function(err) {
      assert.isNull(err);
      cb(err, doc);
    });
  },

  // This should fail, if there's no publication for that doc
  "Create version", function(doc, cb) {
    session.createVersion(function(err) {
      assert.isNull(err);
      cb(err, doc);
    });
  }
];

Substance.registerTest(test);