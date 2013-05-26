(function(root) {

var util = root.Substance.util;
var Chronicle = root.Substance.Chronicle;
var ChronicleTest = root.Substance.test.ChronicleTest;
var ROOT = Chronicle.Index.ROOT_ID;

var Diff = function() {

  ChronicleTest.call(this);

  this.actions = [

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

    "Diff with reverts and applies (04 -> 05)", function() {
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

    }

  ];
};
Diff.prototype = ChronicleTest.prototype;

root.Substance.registerTest(['Chronicle', 'Diff'], new Diff());

})(this);
