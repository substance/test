(function(root) {

var test = new Substance.test.ReplicatorTest({remote: true});

test.actions = [

  "Document should not exist locally", function() {
    assert.isFalse(this.local.exists("lorem_ipsum"));
  },

  "Replicate", function(cb) {
    this.replicator.synch(cb);
  },

  "Now the document should exist locally", function() {
    assert.isTrue(this.local.exists("lorem_ipsum"));
  },

  "Check the document's content", function() {
    session.loadDocument("lorem_ipsum");
    assert.isTrue(!!session.document);
    assert.isFalse(_.isEmpty(session.document.commits));
  }
];

root.Substance.registerTest(['Replicator', 'Create Local'], test);

})(this);
