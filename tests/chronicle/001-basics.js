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

ID_IDX = 0;
function uuid() {
  return ID(ID_IDX++);
}


var Basics = function() {

  this.setup = function() {
    ID_IDX = 0;
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

      console.log("oooO", this.index);

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
      }, this);
    },

  ];
};

root.Substance.registerTest(['Chronicle', 'Basics'], new Basics());

})(this);
