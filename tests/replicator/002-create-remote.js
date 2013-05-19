(function(root) {

var test = {};

test.id = 'replicator-001-create-remote';
test.name= 'Create Remote';
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
      cb(null);
    });
  },

  "Document should not exist remotely", function(cb) {
    session.remoteStore.exists("lorem_ipsum", function(err, exists) {
      assert.isFalse(exists, cb);
      cb(null);
    });
  },

  "Replicate", function(cb) {
    session.replicate(cb);
  },

  "Now the document should exist remotely", function(cb) {
    session.remoteStore.exists("lorem_ipsum", function(err, exists) {
      assert.isTrue(exists, cb);
      cb(null);
    });
  }
];

root.Substance.registerTest(test);
})(this);
