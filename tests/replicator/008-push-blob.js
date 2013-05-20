(function(root) {

var test = {};

test.id = 'replicator-008-push-blob';
test.name = 'Push Blob';
test.category = 'Replicator';

var SEED = "lorem_ipsum.json";
var local, remote;

var OP = [
      "insert",
      {
        "id": "image:1",
        "type": "image",
        "target": "back",
        "data": {
          "medium": "blob1",
          "large": "blob1",
          "caption": "A new image"
        }
      }
     ];

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

  "Load document", function() {
    session.loadDocument("lorem_ipsum");
  },

  "Add a blob with commit locally", function() {
    local.blobs.create("lorem_ipsum", "blob1", "BASE64_BLOBDATA");
    session.document.apply(OP);
  },

  "Replicate", function(cb) {
    session.replicate(cb);
  },

  "Now the remote store should contain the blob", function() {
    var blob = remote.blobs.get("lorem_ipsum", "blob1");
    assert.notNull(blob);
  }
];

root.Substance.registerTest(test);
})(this);
