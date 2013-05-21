(function(root){

function Test(impl) {
  this.actions = Test.actions;
  _.extend(this, impl);
};

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

Test.actions = [
  "Init", function() {
    var options = {
      commits: COMMITS,
      refs: REFS
    };
    this.store.create(ID, options);
  },

  "Getting all commits", function() {
    var info = this.store.getInfo(ID);
    // omitting the 'since' parameter should the whole branch
    var commits = this.store.commits(ID);
    assert.isEqual(COMMITS.length, commits.length);
  },

  "Getting a whole commit chain", function() {
    var info = this.store.getInfo(ID);
    var last = info.refs["bla"]["last"];
    // omitting the 'since' parameter should the whole branch
    var commits = this.store.commits(ID, {last: last});
    assert.isEqual(3, commits.length);
  },

];

if (!root.Substance.test.store) root.Substance.test.store = {};
root.Substance.test.store.Commits = Test;

})(this);
