(function(root) {

var replicator = root.Substance.test.replicator;

var DeleteRemote = function() {

  this.seeds = [{
    requires: "boilerplate",
    local: "lorem_ipsum.json",
  }];

  this.actions = [
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
        if(err) return cb(err);
        assert.isFalse(exists);
        cb(null);
      });
    }
  ];
}
DeleteRemote.prototype = replicator.ReplicatorTest.prototype;

replicator.DeleteRemote = DeleteRemote;
root.Substance.registerTest(['Replicator', 'Delete Remote'], new DeleteRemote());

})(this);
