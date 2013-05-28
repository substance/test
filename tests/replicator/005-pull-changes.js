(function(root) {

var assert = root.Substance.assert;
var _ = root._;
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

var PullChanges = function() {

  this.seeds = [{
    requires: "boilerplate",
    remote: "lorem_ipsum.json"
  }];

  this.actions = [
    "Login", replicator.ReplicatorTest.login("oliver", "abcd"),

    "Initial replication", function(cb) {
      this.session.replicate(cb);
    },

    "Update the remote document", function(cb) {
      // TODO: it could be easier to update the refs implicitely
      var refs = {
        master: {
          head: _.last(COMMITS).sha,
          last: _.last(COMMITS).sha
        }
      };
      var options = {commits: COMMITS, refs: refs};
      this.session.remoteStore.update("lorem_ipsum", options, cb);
    },

    "Replicate", function(cb) {
      this.session.replicate(cb);
    },

    "Now the local document should contain the new commit", function() {
      var doc = this.session.localStore.get("lorem_ipsum");
      assert.isDefined(doc.commits[COMMITS[0].sha]);
      assert.isDefined(doc.commits[COMMITS[1].sha]);
    }
  ];
};
PullChanges.prototype = replicator.ReplicatorTest.prototype;

replicator.PullChanges = PullChanges;
root.Substance.registerTest(['Replicator', 'Pull Changes'], new PullChanges());

})(this);
