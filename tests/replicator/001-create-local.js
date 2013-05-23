(function(root) {

var util = root.Substance.util;
var replicator = root.Substance.test.replicator;

var CreateLocal = function() {

  this.seeds = [{
    requires: "001-boilerplate",
    remote: "lorem_ipsum.json"
  }];

  this.actions = [
    "Login", replicator.ReplicatorTest.login("oliver", "abcd"),

    "Document should not exist locally", function() {
      assert.isFalse(this.session.localStore.exists("lorem_ipsum"));
    },

    "Replicate", function(cb) {
      this.session.replicate(cb);
    },

    "Now the document should exist locally", function() {
      assert.isTrue(this.session.localStore.exists("lorem_ipsum"));
    },

    "Check the document's content", function() {
      this.session.loadDocument("lorem_ipsum");
      assert.isTrue(!!this.session.document);
      assert.isFalse(_.isEmpty(this.session.document.commits));
    }
  ];
};
CreateLocal.prototype = replicator.ReplicatorTest.prototype;

replicator.CreateLocal = CreateLocal;
root.Substance.registerTest(['Replicator', 'Create Local'], new CreateLocal());

})(this);
