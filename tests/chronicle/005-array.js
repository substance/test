(function(root) {

var assert = root.Substance.assert;
var Chronicle = root.Substance.Chronicle;
var ArrayOperation = Chronicle.OT.ArrayOperation;

// Index:
//
// ROOT - 1  -  2  -  3  -  4  -  5

var OP_1 = new ArrayOperation([ArrayOperation.INS, 1, 0]);
var OP_2 = new ArrayOperation([ArrayOperation.INS, 3, 1]);
var OP_3 = new ArrayOperation([ArrayOperation.INS, 2, 1]);
var OP_4 = new ArrayOperation([ArrayOperation.MOV, 0, 3]);
var OP_5 = new ArrayOperation([ArrayOperation.DEL, 3, 1]);

var ARR_1 = [1];
var ARR_2 = [1,3];
var ARR_3 = [1,2,3];
var ARR_4 = [2,3,1];
var ARR_5 = [2,1];

var ArrayOperationTest = function() {

  this.actions = [
    "Basic checkout", function() {
      this.chronicle.open(this.ID4);
      assert.isArrayEqual(ARR_4, this.array);

      this.chronicle.open(this.ID1);
      assert.isArrayEqual(ARR_1, this.array);

      this.chronicle.open(this.ID5);
      assert.isArrayEqual(ARR_5, this.array);

      this.chronicle.open(this.ID3);
      assert.isArrayEqual(ARR_3, this.array);

      this.chronicle.open(this.ID2);
      assert.isArrayEqual(ARR_2, this.array);
    },

  ];

};

ArrayOperationTest.__prototype__ = function() {

  var ID_IDX = 1;

  this.uuid = function() {
    return ""+ID_IDX++;
  };

  this.setup = function() {
    Chronicle.HYSTERICAL = true;
    this.index = Chronicle.Index.create();
    this.chronicle = Chronicle.create(this.index);

    ID_IDX = 1;
    Chronicle.uuid = this.uuid;

    this.array = [];
    this.adapter = new Chronicle.ArrayOperationAdapter(this.chronicle, this.array);

    this.fixture();
  };

  this.apply = function(op) {
    this.adapter.apply(op);
    return this.chronicle.record(op);
  };

  this.fixture = function() {
    this.ID1 = this.apply(OP_1);
    this.ID2 = this.apply(OP_2);
    this.ID3 = this.apply(OP_3);
    this.ID4 = this.apply(OP_4);
    this.ID5 = this.apply(OP_5);
    this.chronicle.reset("ROOT");
  };

};
ArrayOperationTest.prototype = new ArrayOperationTest.__prototype__();

root.Substance.registerTest(['Chronicle', 'Array Operation'], new ArrayOperationTest());

})(this);
