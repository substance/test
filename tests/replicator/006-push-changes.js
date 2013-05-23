(function(root) {

var util = root.Substance.util;
var replicator = root.Substance.test.replicator;

var COMMITS = [
    {
     "op": [
      "insert",
      {
       "id": "text:newtext",
       "type": "text",
       "target": "text:df3af54e",
       "data": {
        "content": ""
       }
      }
     ],
     "sha": "new-commit-1",
     "parent": "f77a5f01b66243135e5e4a2f9b2645fa"
    },
    {
     "op": [
      "update",
      {
       "id": "text:newtext",
       "data": {
        "content": "Hello World"
       }
      }
     ],
     "sha": "new-commit-2",
     "parent": "new-commit-1"
   }
];

var PushChanges = function() {

  this.seeds = [{
    requires: "001-boilerplate",
    local: "lorem_ipsum.json"
  }];

  this.actions = [
    "Login", replicator.ReplicatorTest.login("oliver", "abcd"),

    "Initial replication", function(cb) {
      this.session.replicate(cb);
    },

    "Update the local document", function() {
      // TODO: it should be easier to update the refs implicitely
      var refs = {
        master: {
          head: _.last(COMMITS).sha,
          last: _.last(COMMITS).sha
        }
      };
      var options = {commits: COMMITS, refs: refs}
      this.session.localStore.update("lorem_ipsum", options);
    },

    "Replicate", function(cb) {
      this.session.replicate(cb);
    },

    "Now the remote document should contain the new commit", function(cb) {
      this.session.remoteStore.get("lorem_ipsum", function(err, doc) {
        if(err) return cb(err);
        assert.isDefined(doc);
        assert.isDefined(doc.commits[COMMITS[0].sha]);
        assert.isDefined(doc.commits[COMMITS[1].sha]);
        cb(null);
      });
    }
  ];
};
PushChanges.prototype = replicator.ReplicatorTest.prototype;

replicator.PushChanges = PushChanges;
root.Substance.registerTest(['Replicator', 'Push Changes'], new PushChanges());

})(this);
