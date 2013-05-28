(function(root) {

var Substance = root.Substance;

var test = new Substance.test.replicator.ReplicatorTest();

test.seeds = [{
  requires: "boilerplate",
}];

test.actions = [
  "Create another doc", function() {
    this.session.localStore.create('hello');
  },

  "Push empty doc", function(cb) {
    this.session.replicate(cb);
  },

  "Pull empty doc again", function(cb) {
    this.session.replicate(cb);
  }
];

root.Substance.registerTest(['Replicator', 'Replicate Empty Doc'], test);

})(this);
