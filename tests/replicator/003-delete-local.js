(function(root) {

var replicator = root.Substance.test.replicator;
var test = new replicator.ReplicatorTest({local: true, remote:true});

test.seeds = [{
  requires: "001-boilerplate",
  local: "lorem_ipsum.json",
  remote: "lorem_ipsum.json"
}];

test.actions = [
  "Login", replicator.ReplicatorTest.login("oliver", "abcd"),

  "Initial replication", function(cb) {
    this.session.replicate(cb);
  },

  "Delete remote document", function(cb) {
    this.remote.delete("lorem_ipsum", cb);
  },

  "Replicate", function(cb) {
    this.session.replicate(cb);
  },

  "Now the document should have been removed locally", function() {
    assert.isFalse(this.local.exists("lorem_ipsum"));
  }
];

replicator.DeleteLocal = test;
root.Substance.registerTest(['Replicator', 'Delete Local'], test);

})(this);

