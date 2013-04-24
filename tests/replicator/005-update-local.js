var test = {};

test.id = 'replicator-005-update-local';
test.name = 'Update Local';
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
       "data": [
        "Hello World!"
       ]
      }
     ],
     "sha": "new-commit-2",
     "parent": "new-commit-1"
   }
];

test.actions = [
  "Init the session", function(test, cb) {
    session.authenticate("oliver", "abcd", function(err) {
      if (err) return cb(err);
      var data = {};
      data.localStore = session.localStore;
      data.remoteStore = session.remoteStore;
      cb(null, data);
    });
  },

  "Initial replication", function(data, cb) {
    session.replicate(this.proceed(data, cb));
  },

  "Update the remote document", function(data, cb) {
    // TODO: it should be easier to update the refs implicitely
    var refs = {
      master: {
        head: COMMITS[1].sha,
        last: COMMITS[1].sha
      }
    };
    data.remoteStore.update("lorem_ipsum", COMMITS, null, refs, this.proceed(data, cb));
  },

  "Replicate", function(data, cb) {
    session.replicate(this.proceed(data, cb));
  },

  "Now the local document should contain the new commit", function(data, cb) {
    data.localStore.get("lorem_ipsum", function(err, doc) {
      assert.isDefined(doc.commits[COMMITS[0].sha]);
      assert.isDefined(doc.commits[COMMITS[1].sha]);
      cb(null, data);
    });
  }
];

Substance.registerTest(test);

