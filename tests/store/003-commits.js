(function(root){

var test = {};
test.id = 'store-003-commits';
test.name = 'Commits';
test.category = 'Store';

var store;
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

test.actions = [
  "Init", function() {
    store = new Substance.MemoryStore();
    var options = {
      commits: COMMITS,
      refs: REFS
    };
    store.create(ID, options);
  },

  "Getting all commits", function() {
    var info = store.getInfo(ID);
    // omitting the 'since' parameter should the whole branch
    var commits = store.commits(ID);
    assert.isEqual(COMMITS.length, commits.length);
  },

  "Getting a whole commit chain", function() {
    var info = store.getInfo(ID);
    var last = info.refs["bla"]["last"];
    // omitting the 'since' parameter should the whole branch
    var commits = store.commits(ID, last);
    assert.isEqual(3, commits.length);
  },

];

root.Substance.registerTest(test);

})(this);
