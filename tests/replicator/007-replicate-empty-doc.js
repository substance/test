(function(root) {

var test = {}

test.id = '007-replicate-empty-doc';
test.name = 'Replicate Empty Doc';
test.category = 'Replicator';

var local, remote;

test.actions = [
  "Initialization", function() {
    local =  new Substance.MemoryStore();
    remote = new Substance.MemoryStore();
    session.localStore = local;
    session.remoteStore = new Substance.AsyncStore(remote);
  },

  "Create another doc", function() {
    session.localStore.create('hello');
  },

  "Push empty doc", function(cb) {
    session.replicate(cb);
  },

  "Pull empy again", function(cb) {
    session.replicate(cb);
  }
];

root.Substance.registerTest(test);
})(this);
