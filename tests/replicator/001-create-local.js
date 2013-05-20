(function(root) {

var test = {};

test.id = 'replicator-001-create-local';
test.name = 'Create Local';
test.category = 'Replicator';

var SEED = "lorem_ipsum.json";
var local, remote;
var replicator;

test.actions = [
  "Initialization", function(cb) {
    local = new Substance.MemoryStore();
    remote = new Substance.MemoryStore();
    session.localStore = local;
    session.remoteStore = new Substance.AsyncStore(remote);
    replicator = new Substance.Replicator2({local: local, remote: session.remoteStore, remoteID: "substance.io"});
    Substance.seeds.loadStoreSeed(SEED, function(err, seed) {
      if(err) return cb(err);
      remote.seed(seed['oliver']);
      cb(null);
    });
  },

  "Document should not exist locally", function() {
    assert.isFalse(local.exists("lorem_ipsum"));
  },

  "Replicate", function(cb) {
    replicator.synch(cb);
  },

  "Now the document should exist locally", function() {
    assert.isTrue(local.exists("lorem_ipsum"));
  },

  "Check the document's content", function() {
    session.loadDocument("lorem_ipsum");
    assert.isTrue(!!session.document);
    assert.isFalse(_.isEmpty(session.document.commits));
  }
];

root.Substance.registerTest(test);
})(this);
