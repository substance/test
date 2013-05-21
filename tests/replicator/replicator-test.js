(function(root) {

var SEED = "lorem_ipsum.json";

// A basic implementation used by all replicator tests.
function ReplicatorTest(options) {
  options = options || {};

  this.setup = function(cb) {
    var self = this;

    this.local = new Substance.MemoryStore();
    session.localStore = this.local;
    this.remote = new Substance.MemoryStore();
    session.remoteStore = new Substance.AsyncStore(this.remote);
    this.replicator = new Substance.Replicator2({local: this.local, remote: session.remoteStore, remoteID: "substance.io"});

    Substance.seeds.loadStoreSeed(SEED, function(err, seed) {
      if (err) return cb(err);
      // Note: the seed contains an extra user scope which is not necessary here
      seed = seed.oliver;

      if (options.local) {
        self.local.seed(seed);
      }
      if (options.remote) {
        self.remote.seed(seed);
      }
      cb(null);
    });
  }
};

root.Substance.test.ReplicatorTest = ReplicatorTest;

})(this);
