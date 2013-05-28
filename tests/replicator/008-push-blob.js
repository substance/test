(function(root) {

var assert = root.Substance.assert;
var replicator = root.Substance.test.replicator;

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

var PushBlob = function() {

  this.seeds = [{
    requires: "boilerplate",
    local: "lorem_ipsum.json"
  }];

  this.actions = [
    "Login", replicator.ReplicatorTest.login("oliver", "abcd"),

    "Initial replication", function(cb) {
      this.session.replicate(cb);
    },

    "Load document", function() {
      this.session.loadDocument("lorem_ipsum");
    },

    "Add a blob with commit locally", function() {
      this.session.localStore.createBlob("lorem_ipsum", "blob1", "BASE64_BLOBDATA");
      this.session.document.apply(OP);
    },

    "Replicate", function(cb) {
      this.session.replicate(cb);
    },

    "Now the remote store should contain the blob", function(cb) {
      this.session.remoteStore.getBlob("lorem_ipsum", "blob1", function(err, blob) {
        if(err) return cb(err);
        assert.isDefined(blob);
        cb(null);
      });
    }
  ];
};
PushBlob.prototype = replicator.ReplicatorTest.prototype;

replicator.PushBlob = PushBlob;
root.Substance.registerTest(['Replicator', 'Push Blob'], new PushBlob());

})(this);
