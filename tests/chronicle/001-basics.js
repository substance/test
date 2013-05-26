(function(root) {

var util = root.Substance.util;
var testchronicle = root.Substance.test.chronicle; 
var Chronicle = root.Substance.Chronicle; 


var Basics = function() {

  this.setup = function() {
    this.index = Chronicle.Index.create();
    // TODO: the cyclic dependency is somewhat messy... TODO: rethink.
    this.chronicle = Chronicle.create(this.index);
    Chronicle.HYSTERICAL = true;
    this.comp = new testchronicle.VersionedComputador(this.chronicle);
    this.chronicle.manage(this.comp);
  };

  this.actions = [
    "Apply some operations", function() {
      this.comp.plus(5) // = 5
      assert.isEqual(5, this.comp.result);
      this.comp.minus(3) // = 2
      assert.isEqual(2, this.comp.result);
      this.comp.times(3) // = 6
      assert.isEqual(6, this.comp.result);
      this.comp.div(2) // = 3
      assert.isEqual(3, this.comp.result);
    }
  ];
};

root.Substance.registerTest(['Chronicle', 'Basics'], new Basics());

})(this);
