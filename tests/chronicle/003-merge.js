(function(root) {

var util = root.Substance.util;
var Chronicle = root.Substance.Chronicle;
var ChronicleTest = root.Substance.test.ChronicleTest;
var ROOT = Chronicle.Index.ROOT_ID;

var Merge = function() {

  ChronicleTest.call(this);

  this.actions = [

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
      this.M1 = this.next_uuid();
      this.chronicle.merge("08", "mine");
      // a new change should have been created
      assert.isTrue(this.index.contains(this.M1));
      assert.isEqual(this.M1, this.comp.getHead());

      this.chronicle.reset(ROOT);
      this.chronicle.reset(this.M1);

      // the value should be the same as that of 02
      assert.isEqual(this.M1, this.comp.getHead());
      assert.isEqual(this.RESULTS["02"], this.comp.result);
    },

    "Merge 08 into 02 by rejecting mine", function() {
      this.chronicle.reset("02");
      this.M2 = this.next_uuid();
      this.chronicle.merge("08", "theirs");
      // a new change should have been created
      assert.isTrue(this.index.contains(this.M2));
      assert.isEqual(this.M2, this.comp.getHead());

      this.chronicle.reset(ROOT);
      this.chronicle.reset(this.M2);

      // the value should be the same as that of 02
      assert.isEqual(this.M2, this.comp.getHead());
      assert.isEqual(this.RESULTS["08"], this.comp.result);
    },

    "Move across merge (reverting the merge)", function() {
      this.chronicle.reset(this.M1);
      var path = [this.M1, "08"];
      for (var idx=0; idx < 2; idx++) {
        path.unshift(this.next_uuid());
        this.op(idx);;
      }
      this.chronicle.apply(path);
      assert.isEqual("08", this.comp.getHead());
      assert.isEqual(this.RESULTS["08"], this.comp.result);
    },
  ];
};
Merge.prototype = ChronicleTest.prototype;

root.Substance.registerTest(['Chronicle', 'Merge'], new Merge());

})(this);
