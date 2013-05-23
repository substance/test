(function(root) {

var test = {};
test.seeds = ['002-some-docs'];

var ID = "test-doc-michael-1";

test.actions = [
  "Login", function(cb) {
    this.session.authenticate("michael", "abcd", cb);
  },

  "Open Doc for editing", function() {
    this.session.loadDocument(ID);
  },

  "Create a new blob locally", function() {
    this.session.localStore.createBlob(ID, "blob1", "BASE64_BLOBDATA");
  },

  "Create a new image locally", function() {
    var op = [
      "insert",
      {
        "id": "image:abcd",
        "type": "image",
        "target": "back",
        "data": {
          "medium": "blob1",
          "large": "blob1",
          "caption": "A new image"
        }
      }
    ];

    this.session.document.apply(op);
  },

  // TODO: try to create version before publication. Ensure this properly fails
  // Creating a publication implicitly creates a document entry on the hub
  "Create publication", function(cb) {
    this.session.createPublication("substance", cb);
  },

  // This should fail, if there's no publication for that doc
  // "Create version", function(doc, cb) {
  //   self.session.createVersion(function(err) {
  //     assert.isNull(err);
  //     cb(err, doc);
  //   });
  // }
];

root.Substance.registerTest(['Publishing', 'Publish a version containing blobs'], test);

})(this);
