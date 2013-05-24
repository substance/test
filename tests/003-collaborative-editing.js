(function(root) {

var test = {};

test.seeds = [{
  requires: "boilerplate",
  local: "some_docs.json"
}];

test.actions = [
  "Login", function(cb) {
    this.session.authenticate("michael", "abcd", cb);
  },

  "Initial replication", function(cb) {
    this.session.replicate(cb);
  },

  "Open Doc for editing", function() {
    this.session.loadDocument("test-doc-michael-1");
  },

  "Add collaborator", function(cb) {
    this.session.createCollaborator("oliver", cb);
  },

  // Check if replication still works now that a document entry has been created implicitly by createPublication
  "Replicate with the server", function(cb) {
    this.session.replicate(cb);
  },

  "Login as Oliver", function(cb) {
    this.session.authenticate("oliver", "abcd", cb);
  },

  "Shared document should not be available yet", function() {
    assert.isFalse(this.session.localStore.exists("test-doc-michael-1"));
  },

  "Replicate with the server", function(cb) {
    this.session.replicate(cb);
  },

  "After sync shared doc should be available", function() {
    assert.isTrue(this.session.localStore.exists("test-doc-michael-1"));
    this.session.loadDocument("test-doc-michael-1");
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

    this.session.document.apply(op);
  },

  "In the meanwhile Michael also modifies the doc", function(cb) {
    var self = this;
    
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

    this.session.authenticate("michael", "abcd", function(err) {
      self.session.loadDocument("test-doc-michael-1");
      self.session.document.apply(op);
      cb(null);
    });
  },

  "Replicate with the server", function(cb) {
    this.session.replicate(cb);
  },

  "Now Oliver performs a sync (conflict situation!)", function(cb) {
    var self = this;
    this.session.authenticate("oliver", "abcd", function(err) {
      self.session.replicate(cb);
    });
  },

  "Michael's change should be the winner", function() {
    var doc = this.session.loadDocument("test-doc-michael-1");
    assert.isTrue(doc.nodes['text:xyz'].content === "Michael's text.");
    assert.isTrue(doc.nodes['text:abcd'] === undefined);
  }
];

root.Substance.registerTest(['Collaboration', 'Collaborative Editing'], test);

})(this);
