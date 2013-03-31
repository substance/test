// TODO: create corresponding seed data
// Hub: Document "bla-blupp", has one publication + one version
// client: Document "bla-blupp" in sync with hub

window.test_case = [

  // Delete concerned document locally
  // ----------

  function(data, cb) {
    localStore.delete('bla-blupp', function(err, doc) {
      // assert.ok(doc.id === "hello-world");
      cb(null, doc);
    });
  },

  // Start replication
  // ----------
  
  function(data, cb) {
    // Oliver, implement new replicator first! :)
    Replicator.replicate(localStore, remoteStore, cb);
  },

  // Check if commit has been stored
  // ----------

  function(data, cb) {

    client.getDocument('bla-blupp', function(err) {
      assert(err !== null);

      client.loadPublications('bla-blupp', function(err, publications) {
        assert(publications.length === 0);
        client.loadVersions('bla-blupp', function(err, versions) {
          assert(versions.length === 0);
        });
      });
    });
  }
];
