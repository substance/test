(function(root) {

var assert = root.Substance.assert;
var replicator = root.Substance.test.replicator;

var INSERT_IMAGE = [
      "insert",
      {
        "id": "image1",
        "type": "image",
        "target": "back",
        "data": {
          "medium": "blob1",
          "large": "blob1",
          "caption": "A new image"
        }
      }
     ];

var UPDATED_IMAGE = [
      "update",
      {
        "id": "image1",
        "data": {
          "medium": "blob2",
          "large": "blob2",
          "caption": "Updated image"
        }
      }
     ];

var UpdateBlob = function() {

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
      this.session.document.apply(INSERT_IMAGE);
    },

    "Replicate", function(cb) {
      this.session.replicate(cb);
    },

    "Update the image", function() {
      this.session.localStore.createBlob("lorem_ipsum", "blob2", "BASE64_BLOBDATA");
      this.session.document.apply(UPDATED_IMAGE);
    },

    "Replicate", function(cb) {
      this.session.replicate(cb);
    },

    "Now the remote store should contain the new blob", function(cb) {
      this.session.remoteStore.getBlob("lorem_ipsum", "blob2", function(err, blob) {
        if(err) return cb(err);
        assert.isDefined(blob);
        cb(null);
      });
    }

  ];
};
UpdateBlob.prototype = replicator.ReplicatorTest.prototype;

replicator.UpdateBlob = UpdateBlob;
root.Substance.registerTest(['Replicator', 'Replicate an Updated Blob'], new UpdateBlob());

})(this);
