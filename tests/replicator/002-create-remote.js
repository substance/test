(function(root) {

var assert = root.Substance.assert;
var _ = root._;
var replicator = root.Substance.test.replicator;

var CreateRemote = function() {

  this.seeds = [{
    requires: "boilerplate",
    local: "lorem_ipsum.json"
  }];

  this.actions = [
    "Login", replicator.ReplicatorTest.login("oliver", "abcd"),

    "Document should not exist remotely", function(cb) {
      this.remote.exists("lorem_ipsum", function(err, exists) {
        if(err) return cb(err);
        assert.isFalse(exists);
        cb(null);
      });
    },

    "Replicate", function(cb) {
      this.session.replicate(cb);
    },

    "Now the document should exist remotely", function(cb) {
      var self = this;
      this.remote.get("lorem_ipsum", function(err, data) {
        if(err) return cb(err);
        self.doc = data;
        assert.isDefined(data);
        cb(null);
      });
    },

    "Check the document's content", function() {
      assert.isTrue(!!this.doc);
      assert.isFalse(_.isEmpty(this.doc.commits));
    }
  ];
};
CreateRemote.prototype = replicator.ReplicatorTest.prototype;

replicator.CreateRemote = CreateRemote;
root.Substance.registerTest(['Replicator', 'Create Remote'], new CreateRemote());

})(this);
