(function(root) {

var assert = root.Substance.assert;
var _ = root._;

var ID = "mydoc";
var ID2 = "mydoc2";
var BLA = "bla";
var FOO = "foo";
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
      this.store.create(ID2, options, cb);
    },

    "Document should have initial content", function(cb) {
      this.store.get(ID2, function(err, doc) {
        if(err) return cb(err);
        assert.isDefined(doc.meta);
        assert.isEqual(META[BLA], doc.meta[BLA]);
        assert.isDefined(doc.refs);
        assert.isDefined(doc.refs[BLA]);
        assert.isDefined(doc.refs[BLA][FOO]);
        assert.isEqual(REFS[BLA][FOO], doc.refs[BLA][FOO]);
        cb(null);
      });
    }
  ];
}

if (!root.Substance.test.store) root.Substance.test.store = {};
root.Substance.test.store.Create = Create;

})(this);
