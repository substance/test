(function(root) {

var test = {};

test.id = 'replicator-001-create-local';
test.name = 'Create Local';
test.category = 'Replicator';

var SEED = "lorem_ipsum.json";
var local, remote;

test.actions = [
  "Initialization", function(cb) {
    local = new Substance.MemoryStore();
    remote = new Substance.MemoryStore();
    session.localStore = local;
    session.remoteStore = new Substance.AsyncStore(remote);
    Substance.seeds.loadStoreSeed(SEED, function(err, seed) {
      if(err) return cb(err);
      remote.seed(seed['oliver']);
      cb(null);
    });
  },

  "Document should not exist locally", function() {
    assert.isFalse(session.localStore.exists("lorem_ipsum"));
  },

  "Replicate", function(cb) {
    session.replicate(cb);
  },

  "Now the document should exist locally", function() {
    assert.isTrue(session.localStore.exists("lorem_ipsum"));
  }
];

root.Substance.registerTest(test);
})(this);
