(function(root) {

var assert = root.Substance.assert;
var _ = root._;

var ID = "mydoc";
var ID2 = ID+"2";
var ID3 = ID+"3";
var ID4 = ID+"4";
var META = {"bla": "blupp"};
var META2 = {"foo": "bar"};
var REFS = {"bla": {"foo": "bar"}};
var REFS2 = {"bla": {"bla": "blupp"}};
var BLA = "bla";
var FOO = "foo";

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
var TREE_REFS = {BLA: { "head": "c2_2" }, "blupp": {"head": "c3_2"}};

function Update(impl) {
  _.extend(this, impl);

  this.actions = [
    "Init", function(cb) {
      var options = {
        meta: META,
        refs: REFS
      };
      this.store.create(ID, options, cb);
    },

    "Updating meta should preserve other data", function(cb) {
      var self = this;
      this.store.update(ID, {meta: META2}, function(err) {
        if (err) return cb(err);
        self.store.get(ID, function(err, doc) {
          if (err) return cb(err);
          assert.isEqual(META[BLA], doc.meta[BLA]);
          cb(null);
        });
      });
    },

    "Updating refs should preserve other refs", function(cb) {
      var self = this;
      this.store.update(ID, {refs: REFS2}, function(err) {
        if (err) return cb(err);
        self.store.get(ID, function(err, doc) {
          if (err) return cb(err);
          assert.isEqual(REFS[BLA][FOO], doc.refs[BLA][FOO]);
          cb(null);
        });
      });
    },

    "Multiple commit trees can be applied at once", function(cb) {
      var self = this;
      this.store.create(ID2, function(err) {
        if (err) return cb(err);
        self.store.update(ID2, {commits: COMMITS, refs: TREE_REFS}, function(err) {
          if (err) return cb(err);
          self.store.get(ID2, function(err, doc) {
            if (err) return cb(err);
            _.each(COMMITS, function(c) {
              assert.isDefined(doc.commits[c.sha]);
            });
            cb(null);
          });
        });
      });
    },

    "Commits can be unsorted", function(cb) {
      var self = this;
      this.store.create(ID3, function(err) {
        if (err) return cb(err);
        self.store.update(ID3, {commits: COMMITS_SHUFFLED}, function(err) {
          if (err) return cb(err);
          self.store.get(ID3, function(err, doc) {
            if (err) return cb(err);
            _.each(COMMITS, function(c) {
              assert.isDefined(doc.commits[c.sha]);
            });
            cb(null);
          });
        });
      });
    },

    "Reject commits with invalid parent chains", function(cb) {
      var self = this;
      this.store.create(ID4, function(err) {
        if (err) return cb(err);
        self.store.update(ID4, {commits: COMMITS_INVALID}, function(err) {
          assert.notNull(err);
          cb(null);
        });
      });
    },

    "Reject commits with invalid parent chains - II", function(cb) {
      var self = this;
      this.store.get(ID4, function(err, doc) {
        if (err) return cb(err);
        assert.isTrue(_.isEmpty(doc.commits));
        self.store.update(ID4, {commits: COMMITS_INVALID2}, function(err) {
          assert.notNull(err);
          self.store.get(ID4, function(err, doc) {
            if (err) return cb(err);
            assert.isTrue(_.isEmpty(doc.commits));
            cb(null);
          });
        });
      });
    }
  ];
}

if (!root.Substance.test.store) root.Substance.test.store = {};
root.Substance.test.store.Update = Update;

})(this);
