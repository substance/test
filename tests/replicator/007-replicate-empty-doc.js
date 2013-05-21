(function(root) {

var test = new Substance.test.ReplicatorTest();

test.actions = [
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

root.Substance.registerTest(['Replicator', 'Replicate Empty Doc'], test);

})(this);
