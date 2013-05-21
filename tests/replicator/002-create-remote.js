(function(root) {

var test = new Substance.test.ReplicatorTest({local: true});

test.actions = [

  "Document should not exist remotely", function() {
    assert.isFalse(this.remote.exists("lorem_ipsum"));
  },

  "Replicate", function(cb) {
    this.replicator.sync(cb);
  },

  "Now the document should exist remotely", function() {
    assert.isTrue(this.remote.exists("lorem_ipsum"));
  },

  "Check the document's content", function() {
    var doc = this.remote.get("lorem_ipsum");
    assert.isTrue(!!doc);
    assert.isFalse(_.isEmpty(doc.commits));
  }
];

root.Substance.registerTest(['Replicator', 'Create Remote'], test);

})(this);
