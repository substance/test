// Test data
// ----------

var c1 = {
  "op": [
    "insert",
    {
      "id": "heading:42c72d87e40f529dba27a9970c0a6ef3",
      "type": "heading",
      "data": {
        "content": "Why should I care?"
      }
    }
  ],
  "sha": "b0a4df43adba704eaef6809ada25bc4a"
};


// Expose test case so test runner can find it

window.test_case = [

  // Create a new document
  // ----------

  function(data, cb) {
    localStore.create('hello-world', function(err, doc) {
      // assert.ok(doc.id === "hello-world");
      cb(null, doc);
    });
  },

  // Apply commit
  // ----------
  
  function(data, cb) {
    var meta = {"keywords": ["hello", "world"]};
    var refs = {
      "master": "b0a4df43adba704eaef6809ada25bc4a",
      "tail": "b0a4df43adba704eaef6809ada25bc4a"
    };

    // Apply commit
    localStore.update("hello-world", [c1], function(err) {
      cb(err);
    });
  },

  // Check if commit has been stored
  // ----------

  function(data, cb) {
    localStore.get("hello-world", function(err, doc) {
      // assert(Object.keys(doc.commits).length === 1);
      // assert(doc.refs.master === "b0a4df43adba704eaef6809ada25bc4a");
      // assert(doc.refs.tail === "b0a4df43adba704eaef6809ada25bc4a");
      console.log('LE DOC', doc);
      cb(err, doc);
    });
  }
];
