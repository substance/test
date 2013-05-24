(function(root) {

// This will be mixed into a Session instance, i.e., 'this' = session
var NEW_REPLICATOR = {
  createReplicator: function() {
    return new Substance.Replicator2({local: this.localStore, remote: this.remoteStore, remoteID: "substance-testing"});
  }
};

function ReplicatorTest() {}

ReplicatorTest.__prototype__ = function() {

  this.setup = function() {
    // mix in the TestSession and the replicator factory
    this.session = _.extend(new Substance.Session({env: "test"}),
      new Substance.test.TestSession(), NEW_REPLICATOR);
    // now re-initialize the stores
    this.session.initStores();

    console.log("Setup: this.session=", this.session);
  };

  this.tearDown = function() {
  }

};
ReplicatorTest.prototype = new ReplicatorTest.__prototype__();

ReplicatorTest.login = function(username, password) {
  return function(cb) {
    var self = this;
    this.session.authenticate("oliver", "abcd", function(err) {
      self.local = self.session.localStore;
      self.remote = self.session.remoteStore;
      cb(err);
    });
  };
}


root.Substance.test.replicator = root.Substance.test.replicator || {};
root.Substance.test.replicator.ReplicatorTest = ReplicatorTest;

})(this);
