(function(root) {

var test = {};

test.id = '003-collaborative-editing';
test.name = 'Collaborative Editing';
test.category = '';

test.seeds = ['002-some-docs'];

test.actions = [
  "Login", function(cb) {
    session.authenticate("michael", "abcd", cb);
  },

  "Open Doc for editing", function() {
    session.loadDocument("test-doc-michael-1");
  },

  "Add collaborator", function(cb) {
    session.createCollaborator("oliver", cb);
  },

  // Check if replication still works now that a document entry has been created implicitly by createPublication
  "Replicate with the server", function(cb) {
    session.replicate(cb);
  },

  "Login as Oliver", function(cb) {
    session.authenticate("oliver", "abcd", cb);
  },

  "Shared document should not be available yet", function() {
    assert.isFalse(session.localStore.exists("test-doc-michael-1"));
  },

  "Replicate with the server", function(cb) {
    session.replicate(cb);
  },

  "After sync shared doc should be available", function() {
    assert.isTrue(session.localStore.exists("test-doc-michael-1"));
    session.loadDocument("test-doc-michael-1");
  },

  "Oliver modifies doc", function() {
    var op = [
      "insert",
      {
        "id": "text:abcd",
        "type": "text",
        "target": "back",
        "data": {
          "content": "Oliver's text."
        }
      }
    ];

    session.document.apply(op);
  },

  "In the meanwhile Michael also modifies the doc", function(cb) {
    var op = [
      "insert",
      {
        "id": "text:xyz",
        "type": "text",
        "target": "back",
        "data": {
          "content": "Michael's text."
        }
      }
    ];

    session.authenticate("michael", "abcd", function(err) {
      session.loadDocument("test-doc-michael-1");
      session.document.apply(op);
      cb(null);
    });
  },

  "Replicate with the server", function(cb) {
    session.replicate(cb);
  },

  "Now Oliver performs a sync (conflict situation!)", function(cb) {
    session.authenticate("oliver", "abcd", function(err) {
      session.replicate(cb);
    });
  },

  "Michael's change should be the winner", function() {
    session.loadDocument("test-doc-michael-1");
    var doc = session.document;
    assert.isTrue(doc.nodes['text:xyz'].content === "Michael's text.");
    assert.isTrue(doc.nodes['text:abcd'] === undefined);
  }
];

root.Substance.registerTest(test);
})(this);
