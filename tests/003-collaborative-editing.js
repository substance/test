var test = {};

test.id = '003-collaborative-editing';
test.name = 'Collaborative Editing';
test.category = '';

test.seeds = ['002-some-docs'];

test.actions = [
  "Login", function(test, cb) {
    session.authenticate("michael", "abcd", cb);
  },

  "Open Doc for editing", function(data, cb) {
    session.loadDocument("test-doc-michael-1", cb);
  },

  "Add collaborator", function(data, cb) {
    session.createCollaborator("oliver", cb);
  },

  // Check if replication still works now that a document entry has been created implicitly by createPublication
  "Replicate with the server", function(data, cb) {
    var replicator = new Substance.Replicator({store: localStore, user: "michael"});
    replicator.sync(cb);
  },

  "Login as Oliver", function(data, cb) {
    session.authenticate("oliver", "abcd", cb);
  },

  "Try to access shared document", function(data, cb) {
    session.loadDocument("test-doc-michael-1", function(err) {
      assert.isTrue(!!err);
      cb(null, data);
    });
  },

  "Replicate with the server", function(data, cb) {
    var replicator = new Substance.Replicator({store: localStore, user: "oliver"});
    replicator.sync(cb);
  },

  "After sync shared doc should be available", function(data, cb) {
    session.loadDocument("test-doc-michael-1", function(err, doc) {
      assert.isTrue(!err);
      cb(null, data);
    });
  },

  "Oliver modifies doc", function(data, cb) {
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
    cb(null);
  },

  "In the meanwhile Michael also modifies the doc", function(data, cb) {
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
      session.loadDocument("test-doc-michael-1", function(err, doc) {
        session.document.apply(op);
        cb(null);
      });
    });
  },

  "Replicate with the server", function(data, cb) {
    var replicator = new Substance.Replicator({store: localStore, user: "michael"});
    replicator.sync(cb);
  },

  "Now Oliver performs a sync (conflict situation!)", function(data, cb) {
    session.authenticate("oliver", "abcd", function(err) {
      var replicator = new Substance.Replicator({store: localStore, user: "oliver"});
      replicator.sync(cb);
    });
  },

  "Michael's change should be the winner", function(data, cb) {
    session.loadDocument("test-doc-michael-1", function(err, doc) {
      assert.isTrue(doc.content.nodes['text:xyz'].content === "Michael's text.");
      assert.isTrue(doc.content.nodes['text:abcd'] === undefined);
      cb(null);
    });
  }
];
