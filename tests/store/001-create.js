(function(root) {

function Test(impl) {
  this.actions = Test.actions;
  _.extend(this, impl);
};

var ID = "mydoc";
var ID2 = "mydoc2";
var META = {"bla": "blupp"};
var REFS = {"bla": {"foo": "bar"}};

Test.actions = [
  "Create a doc", function() {
    this.store.create(ID);
  },

  "Doc should exist", function() {
    assert.isTrue(this.store.exists(ID));
  },

  "Create a document with intial data", function() {
    var options = {
      meta: META,
      refs: REFS
    };
    this.store.create(ID2, options)
  },

  "Document should have initial content", function() {
    var doc = this.store.get(ID2);
    assert.isDefined(doc.meta);
    assert.isEqual(META["bla"], doc.meta["bla"]);
    assert.isDefined(doc.refs);
    assert.isDefined(doc.refs["bla"]);
    assert.isDefined(doc.refs["bla"]["foo"]);
    assert.isEqual(REFS["bla"]["foo"], doc.refs["bla"]["foo"]);
  }

];

if (!root.Substance.test.store) root.Substance.test.store = {};
root.Substance.test.store.Create = Test;

})(this);
