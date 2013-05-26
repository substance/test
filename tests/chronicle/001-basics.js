(function(root) {

var util = root.Substance.util;
var testchronicle = root.Substance.test.chronicle;
var Chronicle = root.Substance.Chronicle;

__ID__ = 0;
__OP__ = 1;
__VAL__ = 2;
__RESULT__ = 3;

var ROOT = Chronicle.Index.ROOT_ID;

// ROOT - 01 - 02 - 03 - 04
//    |              |
//    |                - 05 - 06
//      - 07 - 08
var INDEX = [
  ["01", "plus", 5, 5], // = 5
  ["02", "minus", 3, 2], // = 2
  ["03", "times", 3, 6], // = 6
  ["04", "div", 2, 3], // = 3
  ["05", "plus", 1, 7], // = 7 // applied on 03
  ["06", "plus", 2, 9], // = 9
  ["07", "minus", 1, -1], // = -1 // applied on __ROOT__
  ["08", "minus", 2, -3], // = -3
];

function ID(i) {return INDEX[i][__ID__];};
function OP(i) {return INDEX[i][__OP__];};
function VAL(i) {return INDEX[i][__VAL__];};

RESULTS = _.reduce(INDEX, function(memo, e) {
  memo[e[__ID__]] = e[__RESULT__]; return memo;
}, {});
RESULTS[ROOT] = 0;

ID_IDX = 1;
function _uuid(idx) {
  return (idx < 10) ? "0"+idx : ""+idx;
}
function uuid() {
  return _uuid(ID_IDX++);
}

function next_uuid() {
  return _uuid(ID_IDX);
}

var Basics = function() {

  this.setup = function() {
    ID_IDX = 1;
    this.index = Chronicle.Index.create();
    this.chronicle = Chronicle.create(this.index);
    Chronicle.HYSTERICAL = true;
    this.comp = new testchronicle.VersionedComputador(this.chronicle);
    // TODO: the cyclic dependency is somewhat messy... rethink.
    this.chronicle.manage(this.comp);
    Chronicle.uuid = uuid;
  };

  this.actions = [

    "Apply some more operations", function() {
      // Attention: these call will automatically increment the UUIDs
      for (var idx=0; idx < 4; idx++) {
        this.comp[OP(idx)](VAL(idx));
      }
      this.chronicle.reset("03");
      for (var idx=4; idx < 6; idx++) {
        this.comp[OP(idx)](VAL(idx));
      }
      this.chronicle.reset(ROOT);
      for (var idx=6; idx < 8; idx++) {
        this.comp[OP(idx)](VAL(idx));
      }
      this.comp.reset();
    },

    "Diff (01 -> 02)", function() {
      // only applies: 00 -> 01 -> 02
      var diff = this.index.diff("01", "02");
      assert.isArrayEqual(["01", "02"], diff.sequence());
      assert.isEqual(0, diff.reverts().length);
      assert.isArrayEqual(["02"], diff.applies());
    },

    "Diff (02 -> 01)", function() {

      // only reverts: 02 -> 01 -> 00
      var diff = this.index.diff("02", "01");
      assert.isArrayEqual(["02", "01"], diff.sequence());
      assert.isEqual(0, diff.applies().length);
      assert.isArrayEqual(["01"], diff.reverts());

    },

    "Diff to ROOT (01 -> ROOT)", function() {

      var diff = this.index.diff("01", ROOT);
      assert.isArrayEqual(["01", ROOT], diff.sequence());
      assert.isArrayEqual([ROOT], diff.reverts());
      assert.isArrayEqual([], diff.applies());

    },

    "Diff from ROOT (ROOT -> 08)", function() {

      var diff = this.index.diff(ROOT, "08");
      assert.isArrayEqual([ROOT, "07", "08"], diff.sequence());
      assert.isArrayEqual([], diff.reverts());
      assert.isArrayEqual(["07", "08"], diff.applies());

    },

    "No Diff (02 -> 02)", function() {
      var diff = this.index.diff("02", "02");
      assert.isArrayEqual(["02"], diff.sequence());
      assert.isArrayEqual([], diff.reverts());
      assert.isArrayEqual([], diff.applies());
    },

    "Diff (04 -> 05)", function() {
      // mixed: 04 -> 03 -> 05
      var diff = this.index.diff("04", "05");
      assert.isArrayEqual(["04", "03", "05"], diff.sequence());
      assert.isArrayEqual(["03"], diff.reverts());
      assert.isArrayEqual(["05"], diff.applies());
    },

    "Diff across ROOT (07 -> 01)", function() {

      var diff = this.index.diff("07", "01");
      assert.isArrayEqual(["07", ROOT, "01"], diff.sequence());
      assert.isArrayEqual([ROOT], diff.reverts());
      assert.isArrayEqual(["01"], diff.applies());

    },

    "Reset", function() {
      this.comp.reset();

      var seq = ["07", "05", "04", ROOT, "06", "08", "03", "01", "02"];
      _.each(seq, function(id) {
        this.chronicle.reset(id);
        assert.isEqual(RESULTS[id], this.comp.result);
        assert.isEqual(id, this.comp.getHead());
      }, this);
    },

    "Merge 01 into 02 (nothing to be done)", function() {
      this.chronicle.reset("02");
      var count = this.index.list().length;
      this.chronicle.merge("01");
      // no additional change should have been applied
      assert.isEqual(count, this.index.list().length);
    },

    "Merge 02 into 01 (fast-forward, no extra change)", function() {
      this.chronicle.reset("01");
      var count = this.index.list().length;
      this.chronicle.merge("02");
      // no additional change should have been applied
      assert.isEqual(count, this.index.list().length);
      assert.isEqual("02", this.comp.getHead());
    },

    "Merge 08 into 02 by rejecting theirs", function() {
      this.chronicle.reset("02");
      this.M1 = next_uuid();
      this.chronicle.merge("08", "mine");
      // a new change should have been created
      assert.isTrue(this.index.contains(this.M1));
      assert.isEqual(this.M1, this.comp.getHead());

      this.chronicle.reset(ROOT);
      this.chronicle.reset(this.M1);

      // the value should be the same as that of 02
      assert.isEqual(this.M1, this.comp.getHead());
      assert.isEqual(RESULTS["02"], this.comp.result);
    },

    "Move from M1 to 08 (reverting the merge)", function() {
      this.chronicle.reset(this.M1);
      this.chronicle.apply("08");
      assert.isEqual("08", this.comp.getHead());
      assert.isEqual(RESULTS["08"], this.comp.result);
    },
  ];
};

root.Substance.registerTest(['Chronicle', 'Basics'], new Basics());

})(this);
