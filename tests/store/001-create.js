(function(root) {

var test = {};

test.id = 'store-001-create';
test.name = 'Create';
test.category = 'Store';

var store;
var ID = "mydoc";
var ID2 = "mydoc2";
var META = {"bla": "blupp"};
var REFS = {"bla": {"foo": "bar"}};

test.actions = [
  "Init", function() {
    store = new Substance.MemoryStore();
  },

  "Create a doc", function() {
    store.create(ID);
  },

  "Doc should exist", function() {
    assert.isTrue(store.exists(ID));
  },

  "Create a document with intial data", function() {
    var options = {
      meta: META,
      refs: REFS
    };
    store.create(ID2, options)
  },

  "Document should have initial content", function() {
    var doc = store.get(ID2);
    assert.isDefined(doc.meta);
    assert.isEqual(META["bla"], doc.meta["bla"]);
    assert.isDefined(doc.refs);
    assert.isDefined(doc.refs["bla"]);
    assert.isDefined(doc.refs["bla"]["foo"]);
    assert.isEqual(REFS["bla"]["foo"], doc.refs["bla"]["foo"]);
  }

];

root.Substance.registerTest(test);
})(this);
