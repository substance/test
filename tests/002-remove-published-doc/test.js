var test = new Substance.Test();

test.seeds = ['002-some-docs'];

test.defaultType = "composer";

test.actions = [
  ["composer", "Login", function(data, cb) {
    session.authenticate("michael", "abcd", cb);
  }],

  ["composer", "Open Doc for editing", function(test, cb) {
    session.loadDocument("test-doc-michael-1", function(err, doc) {
      cb(err, doc);
    });
  }],

  // TODO: try to create version before publication. Ensure this properly fails

  // Creating a publication implicitly creates a document entry on the hub
  ["composer", "Create publication", function(doc, cb) {
    session.createPublication("substance", function(err) {
      assert.isNull(err);
      cb(err, doc);
    });
  }],

  // This should fail, if there's no publication for that doc
  ["composer", "Create version", function(doc, cb) {
    session.createVersion(function(err) {
      assert.isNull(err);
      cb(err, doc);
    });
  }],

  // Check if replication still works now that a document entry has been created implicitly by createPublication
  ["composer", "Replicate with the server", function(docCount, cb) {
    var replicator = new Substance.Replicator({store: localStore, user: "michael"});
    replicator.sync(cb);
  }],

  ["composer", "Delete doc locally", function(doc, cb) {
    session.deleteDocument("test-doc-michael-1", function(err) {
      assert.isNull(err);
      session.loadDocument("test-doc-michael-1", function(err, doc) {
        assert.isTrue(!doc);
        cb(null, doc);
      })
    });
  }],

  ["composer", "Trigger replication again", function(doc, cb) {
    var replicator = new Substance.Replicator({store: localStore, user: "michael"});
    replicator.sync(function(err) {
      assert.isTrue(!err);
      cb(null, doc);
    });
  }],

  ["composer", "After the sync all publications for that doc should be gone", function(doc, cb) {
    session.loadPublications(function(err) {
      assert.isTrue(session.publications.length === 0);
      cb(null, doc);
    });
  }],

  // Alternatively, we could check that on the hub
  // ["hub", "After the sync all publications for that doc should be gone", function(doc, cb) {
  //   publications.findByDocument("test-doc-michael-1", function(err, pubs) {
  //     assert.isTrue(pubs.length === 0);
  //     cb(null, doc);
  //   });
  // }],

  // ["hub", "Same with versions", function(doc, cb) {
  //   versions.findLatest("test-doc-michael-1", function(err) {
  //     assert.isTrue(!err);
  //   });
  // }]
];

Substance.tests['002-remove-published-doc'] = test;
