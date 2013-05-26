(function(root) {

var util = root.Substance.util;
var testchronicle = root.Substance.test.chronicle; 
var Chronicle = root.Substance.Chronicle; 

__ID__ = 0;
__OP__ = 1;
__VAL__ = 2;
var C = [
  ["00", "plus", 5],
  ["01", "minus", 3],
  ["02", "times", 3],
  ["03", "div", 2],
  ["04", "plus", 1],
  ["05", "plus", 2],
];

function ID(i) {return C[i][__ID__];};
function OP(i) {return C[i][__OP__];};
function VAL(i) {return C[i][__VAL__];};

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
    "Apply some operations", function() {
      for (var idx=0; idx < 4; idx++) {
        this.comp[OP(idx)](VAL(idx));
      }

      this.chronicle.reset("02");

      for (var idx=4; idx < 6; idx++) {
        this.comp[OP(idx)](VAL(idx));
      }

      console.log("oooO", this.index);
    }
  ];
};

root.Substance.registerTest(['Chronicle', 'Basics'], new Basics());

})(this);
