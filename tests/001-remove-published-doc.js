(function(root) {

var test = {}

test.seeds = [{
  requires: "boilerplate",
  local: "some_docs.json"
}];

test.actions = [
  "Login", function(cb) {
    this.session.authenticate("michael", "abcd", cb);
  },

  "Open Doc for editing", function() {
    doc = this.session.loadDocument("test-doc-michael-1");
  },

  // Note: I think there is an inconsistency with keeping publications independent from replication.
  // Publications should not be created by unauthorized persons, but only by creators or collaborators.
  // Without any previous document replication the hub can not verify this.
  // Furthermore, having a second way to claim document ids via publiations brings an extra inconsistency.
  // Anyways, I don't see much gain in separating publications from replication - only more problems.
  // TODO: discuss.
  "Replicate", function(cb) {
    this.session.replicate(cb);
  },

  // TODO: try to create version before publication. Ensure this properly fails

  // Creating a publication implicitly creates a document entry on the hub
  "Create publication", function(cb) {
    this.session.createPublication("substance", cb);
  },

  // This should fail, if there's no publication for that doc
  "Create version", function(cb) {
    this.session.createVersion(cb);
  },

  // Check if replication still works now that a document entry has been created implicitly by createPublication
  "Replicate with the server", function(cb) {
    this.session.replicate(cb);
  },

  "Delete doc locally", function() {
    this.session.deleteDocument("test-doc-michael-1");
  },

  "Trigger replication again", function(cb) {
    this.session.replicate(cb);
  },

  "After the sync all publications for that doc should be gone", function(cb) {
    var self = this;
    this.session.loadPublications(function(err) {
      if (err) return cb(err);
      assert.isTrue(self.session.publications.length === 0);
      cb(null);
    });
  },

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

root.Substance.registerTest(['Publishing', 'Remove Published Doc'], test);

})(this);
