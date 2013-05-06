var test = {};

test.id = 'replicator-006-push-changes';
test.name = 'Push Changes';
test.category = 'Replicator';

test.seeds = [
  {
    requires: "001-boilerplate",
    local: "lorem_ipsum.json",
    remote: "lorem_ipsum.json"
  }
];

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

test.actions = [
  "Init the session", function(test, cb) {
    session.authenticate("oliver", "abcd", cb);
  },

  "Initial replication", function(data, cb) {
    session.replicate(this.proceed(data, cb));
  },

  "Update the local document", function(data, cb) {
    // TODO: it should be easier to update the refs implicitely
    var refs = {
      master: {
        head: _.last(COMMITS).sha,
        last: _.last(COMMITS).sha
      }
    };
    var options = {commits: COMMITS, refs: refs}
    session.localStore.update("lorem_ipsum", options, this.proceed(data, cb));
  },

  "Replicate", function(data, cb) {
    session.replicate(this.proceed(data, cb));
  },

  "Now the remote document should contain the new commit", function(data, cb) {
    session.remoteStore.get("lorem_ipsum", function(err, doc) {
      assert.isDefined(doc.commits[COMMITS[0].sha], cb);
      assert.isDefined(doc.commits[COMMITS[1].sha], cb);
      cb(null, doc);
    });
  }
];

Substance.registerTest(test);
