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

  "Delete local document", function() {
    this.local.delete("lorem_ipsum");
  },

  "Replicate", function(cb) {
    this.session.replicate(cb);
  },

  "Now the document should have been removed remotely", function(cb) {
    this.remote.exists("lorem_ipsum", function(err, exists) {
      assert.isFalse(exists);
      cb(null);
    });
  }
];

replicator.DeleteRemote = test;
root.Substance.registerTest(['Replicator', 'Delete Remote'], test);

})(this);
