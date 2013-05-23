(function(root) {

var ID = "mydoc";
var ID2 = "mydoc2";
var META = {"bla": "blupp"};
var REFS = {"bla": {"foo": "bar"}};

function Create(impl) {
  _.extend(this, impl);
  
  this.actions = [

    "Create a doc", function(cb) {
      this.store.create(ID, cb);
    },

    "Doc should exist", function(cb) {
      this.store.exists(ID, function(err, exists) {
        if(err) return cb(err);
        assert.isTrue(exists);
        cb(null);
      });
    },

    "Create a document with intial data", function(cb) {
      var options = {
        meta: META,
        refs: REFS
      };
      this.store.create(ID2, options, cb)
    },

    "Document should have initial content", function(cb) {
      this.store.get(ID2, function(err, doc) {
        if(err) return cb(err);
        assert.isDefined(doc.meta);
        assert.isEqual(META["bla"], doc.meta["bla"]);
        assert.isDefined(doc.refs);
        assert.isDefined(doc.refs["bla"]);
        assert.isDefined(doc.refs["bla"]["foo"]);
        assert.isEqual(REFS["bla"]["foo"], doc.refs["bla"]["foo"]);
        cb(null);
      });
    }
  ];
};

if (!root.Substance.test.store) root.Substance.test.store = {};
root.Substance.test.store.Create = Create;

})(this);
