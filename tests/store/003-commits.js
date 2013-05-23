(function(root){

var ID = "mydoc";

function commit(id, parent) {
  var target = parent || "back";
  return { "op": [
    "insert", { "id": id, "type": "text", "data": { "content": ""},
     "target": target,
    }],
    "sha": id,
    "parent": parent
  };
}

var C1 = commit("c1", null);
var C2_1 = commit("c2_1", "c1");
var C2_2 = commit("c2_2", "c2_1");
var C3_1 = commit("c3_1", "c1");
var C3_2 = commit("c3_2", "c3_1");
var C3_3 = commit("c3_3", "c3_2");
var COMMITS = [C1, C2_1, C2_2, C3_1, C3_2, C3_3];
var REFS = {"bla": { "last": "c2_2" }, "blupp": {"last": "c3_3"}};

function Commits(impl) {
  _.extend(this, impl);

  this.actions = [
    "Init", function(cb) {
      var options = {
        commits: COMMITS,
        refs: REFS
      };
      this.store.create(ID, options, cb);
    },

    "Getting all commits", function(cb) {
      // omitting the 'since' parameter should the whole branch
      this.store.commits(ID, {}, function(err, commits) {
        if(err) return cb(err);
        assert.isEqual(COMMITS.length, commits.length);
        cb(null);
      });
    },

    "Getting a whole commit chain", function(cb) {
      var self = this;
      this.store.getInfo(ID, function(err, info) {
        if(err) return cb(err);
        var last = info.refs["bla"]["last"];
        self.store.commits(ID, {last: last}, function(err, commits) {
          if(err) return cb(err);
          assert.isEqual(3, commits.length);
          cb(null);
        });
      });
    },

  ];
};

if (!root.Substance.test.store) root.Substance.test.store = {};
root.Substance.test.store.Commits = Commits;

})(this);
