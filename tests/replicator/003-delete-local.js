(function(root) {

var test = {};

test.id = 'replicator-003-delete-local';
test.name = 'Delete Local';
test.category = 'Replicator';

var SEED = "lorem_ipsum.json";
var local, remote;

test.actions = [
  "Initialization", function(cb) {
    local =  new Substance.MemoryStore();
    remote = new Substance.MemoryStore();
    session.localStore = local;
    session.remoteStore = new Substance.AsyncStore(remote);
    Substance.seeds.loadStoreSeed(SEED, function(err, seed) {
      if(err) return cb(err);
      local.seed(seed['oliver']);
      remote.seed(seed['oliver']);
      cb(null);
    });
  },

  "Initial replication", function(cb) {
    session.replicate(cb);
  },

  "Delete remote document", function(cb) {
    session.remoteStore.delete("lorem_ipsum", cb);
  },

  "Replicate", function(cb) {
    session.replicate(cb);
  },

  "Now the document should have been removed locally", function() {
    assert.isFalse(session.localStore.exists("lorem_ipsum"));
  }
];

root.Substance.registerTest(test);
})(this);
