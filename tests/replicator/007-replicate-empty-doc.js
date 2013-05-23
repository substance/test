(function(root) {

var test = new Substance.test.replicator.ReplicatorTest();

test.actions = [
  "Create another doc", function() {
    this.session.localStore.create('hello');
  },

  "Push empty doc", function(cb) {
    this.session.replicate(cb);
  },

  "Pull empy again", function(cb) {
    this.session.replicate(cb);
  }
];

root.Substance.registerTest(['Replicator', 'Replicate Empty Doc'], test);

})(this);
