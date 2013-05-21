(function(root) {

function Test(impl) {
  this.actions = Test.actions;
  _.extend(this, impl);
};

var ID = "mydoc";
var ID2 = ID+"2";
var ID3 = ID+"3";
var ID4 = ID+"4";
var META = {"bla": "blupp"};
var META2 = {"foo": "bar"};
var REFS = {"bla": {"foo": "bar"}};
var REFS2 = {"bla": {"bla": "blupp"}};

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
var COMMITS = [C1, C2_1, C2_2, C3_1, C3_2];
var COMMITS_SHUFFLED = [C2_1, C3_2, C1, C2_2, C3_1];
var COMMITS_INVALID = [C2_1, C2_2];
var COMMITS_INVALID2 = [C1, C2_2];
var TREE_REFS = {"bla": { "head": "c2_2" }, "blupp": {"head": "c3_2"}};

Test.actions = [
  "Init", function() {
    var options = {
      meta: META,
      refs: REFS
    };
    this.store.create(ID, options);
  },

  "Updating meta should preserver other data", function() {
    this.store.update(ID, {meta: META2});
    var doc = this.store.get(ID);
    assert.isEqual(META["bla"], doc.meta["bla"]);
  },

  "Updating refs should preserve other refs", function() {
    this.store.update(ID, {refs: REFS2});
    var doc = this.store.get(ID);
    assert.isEqual(REFS["bla"]["foo"], doc.refs["bla"]["foo"]);
  },

  "Multiple commit trees can be applied at once", function() {
    this.store.create(ID2)
    var success = this.store.update(ID2, {commits: COMMITS, refs: TREE_REFS});
    assert.isTrue(success);
    var doc = this.store.get(ID2);
    _.each(COMMITS, function(c) {
      assert.isDefined(doc.commits[c.sha]);
    });
  },

  "Commits can be unsorted", function() {
    this.store.create(ID3)
    var success = this.store.update(ID3, {commits: COMMITS_SHUFFLED});
    assert.isTrue(success);
    var doc = this.store.get(ID3);
    _.each(COMMITS, function(c) {
      assert.isDefined(doc.commits[c.sha]);
    });
  },

  "Reject commits with invalid parent chains", function() {
    this.store.create(ID4)

    assert.exception(function() {
      this.store.update(ID4, {commits: COMMITS_INVALID});
    });

    var doc = this.store.get(ID4);
    assert.isTrue(_.isEmpty(doc.commits));

    assert.exception(function() {
      this.store.update(ID4, {commits: COMMITS_INVALID2});
    });

    doc = this.store.get(ID4);
    assert.isTrue(_.isEmpty(doc.commits));
  }

];

if (!root.Substance.test.store) root.Substance.test.store = {};
root.Substance.test.store.Update = Test;

})(this);
