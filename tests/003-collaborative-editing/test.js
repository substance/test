var test = new Substance.Test();

test.seeds = ['002-some-docs'];

test.defaultType = "composer";


test.actions = [
  ["composer", "Login", function(data, cb) {
    session.authenticate("michael", "abcd", cb);
  }],

  ["composer", "Open Doc for editing", function(data, cb) {
    session.loadDocument("test-doc-michael-1", cb);
  }],

  ["composer", "Add collaborator", function(data, cb) {
    session.createCollaborator("oliver", cb);
  }],

  // Check if replication still works now that a document entry has been created implicitly by createPublication
  ["composer", "Replicate with the server", function(data, cb) {
    var replicator = new Substance.Replicator({store: localStore, user: "michael"});
    replicator.sync(cb);
  }],

  ["composer", "Login as Oliver", function(data, cb) {
    session.authenticate("oliver", "abcd", cb);
  }],

  ["composer", "Try to access shared document", function(data, cb) {
    // session.loadDocument("test-doc-michael-1", function(err) {
    //   assert.isTrue(!!err);
    //   cb(null, data);
    // });
    session.loadDocument("test-doc-michael-1", cb);
  }],

  ["composer", "Replicate with the server", function(data, cb) {
    var replicator = new Substance.Replicator({store: localStore, user: "oliver"});
    replicator.sync(cb);
  }],

  ["composer", "After sync shared doc should be available", function(data, cb) {
    session.loadDocument("test-doc-michael-1", function(err, doc) {
      assert.isTrue(!err);
      cb(null, data);
    });
  }],

  ["composer", "Oliver modifies doc", function(data, cb) {
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
  }],

  ["composer", "In the meanwhile Michael also modifies the doc", function(data, cb) {
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
  }],

  ["composer", "Replicate with the server", function(data, cb) {
    var replicator = new Substance.Replicator({store: localStore, user: "michael"});
    replicator.sync(cb);
  }],

  ["composer", "Now Oliver performs a sync (conflict situation!)", function(data, cb) {
    session.authenticate("oliver", "abcd", function(err) {
      var replicator = new Substance.Replicator({store: localStore, user: "oliver"});
      replicator.sync(cb);
    });
  }],

  ["composer", "Michael's change should be the winner", function(data, cb) {
    session.loadDocument("test-doc-michael-1", function(err, doc) {
      assert.isTrue(doc.content.nodes['text:xyz'].content === "Michael's text.");
      assert.isTrue(doc.content.nodes['text:abcd'] === undefined);
      cb(null);
    });
  }]

];

Substance.tests['003-collaborative-editing'] = test;
