(function(root) {

var assert = root.Substance.assert;
var Chronicle = root.Substance.Chronicle;
var ArrayOperation = Chronicle.OT.ArrayOperation;

// Index:
//
// ROOT - 1  -  2  -  3  -  4  -  5
//        |                 \
//        |                   M1 (1,2,6,4)
//        |---  6  ---------/

var OP_1 = new ArrayOperation([ArrayOperation.INS, 0, 1]);
var OP_2 = new ArrayOperation([ArrayOperation.INS, 1, 3]);
var OP_3 = new ArrayOperation([ArrayOperation.INS, 1, 2]);
var OP_4 = new ArrayOperation([ArrayOperation.MOV, 0, 2]);
var OP_5 = new ArrayOperation([ArrayOperation.DEL, 1, 3]);
var OP_6 = new ArrayOperation([ArrayOperation.INS, 1, 4]);

var ARR_1 = [1];
var ARR_2 = [1,3];
var ARR_3 = [1,2,3];
var ARR_4 = [2,3,1];
var ARR_5 = [2,1];
//var ARR_6 = [1,4];

// Note: if you merge a move it will have its range between elements
// that existed in that branch. It can't reach behind or before elements that have been
// inserted at front or back in another branch.
// The consequence is that merge in the example above results in [3,1,4] and not [3,4,1].
var ARR_M1 = [3,1,4];

function testTransform(a, b, input, expected) {
  var t = ArrayOperation.transform(a, b);

  var output = t[1].apply(a.apply(input.slice(0)));
  assert.isArrayEqual(expected, output);

  output = t[0].apply(b.apply(input.slice(0)));
  assert.isArrayEqual(expected, output);

}


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

    "Transformation: a=Insert, b=Insert, a before b", function() {
      var input = [1,3,5];
      var expected = [1,2,3,4,5];
      var a = new ArrayOperation(["+", 1, 2]);
      var b = new ArrayOperation(["+", 2, 4]);

      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected);
    },

    "Transformation: a=Insert, b=Insert, same position", function() {
      var input = [1,4];
      var expected = [1,2,3,4];
      var expected_2 = [1,3,2,4];
      var a = new ArrayOperation(["+", 1, 2]);
      var b = new ArrayOperation(["+", 1, 3]);

      // in this case the transform is not symmetric
      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected_2);
    },

    "Transformation: a=Delete, b=Delete, a before b", function() {
      var input = [1,2,3,4,5];
      var expected = [1,3,5];
      var a = new ArrayOperation(["-", 1, 2]);
      var b = new ArrayOperation(["-", 3, 4]);

      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected);
    },

    "Transformation: a=Delete, b=Delete, deleting the same", function() {
      var input = [1,2,3];
      var expected = [1,3];
      var a = new ArrayOperation(["-", 1, 2]);
      var b = new ArrayOperation(["-", 1, 2]);

      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected);
    },

    "Transformation: a=Insert, b=Delete, a before b", function() {
      var input = [1,3,4,5];
      var expected = [1,2,3,5];
      var a = new ArrayOperation(["+", 1, 2]);
      var b = new ArrayOperation(["-", 2, 4]);

      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected);
    },

    "Transformation: a=Insert, b=Delete, same position", function() {
      var input = [1,2,3];
      var expected = [1,4,3];
      var a = new ArrayOperation(["+", 1, 4]);
      var b = new ArrayOperation(["-", 1, 2]);

      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected);
    },

    "Transformation: a=Move, b=Delete, a left of b", function() {
      var input = [1,2,3];
      var expected = [2,1];
      var a = new ArrayOperation([">>", 0, 1]);
      var b = new ArrayOperation(["-", 2, 3]);

      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected);
    },

    "Transformation: a=Move, b=Delete, a.s < b < a.t", function() {
      var input = [1,2,3];
      var expected = [3,1];
      var a = new ArrayOperation([">>", 0, 2]);
      var b = new ArrayOperation(["-", 1, 2]);

      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected);
    },

    "Transformation: a=Move, b=Delete, b < a.s < a.t", function() {
      var input = [1,2,3];
      var expected = [3,2];
      var a = new ArrayOperation([">>", 1, 2]);
      var b = new ArrayOperation(["-", 0, 1]);

      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected);
    },

    "Transformation: a=Move, b=Delete, a.t < b < a.s", function() {
      var input = [1,2,3];
      var expected = [3,1];
      var a = new ArrayOperation([">>", 2, 0]);
      var b = new ArrayOperation(["-", 1, 2]);

      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected);
    },

    "Transformation: a=Move, b=Delete, a.s == b", function() {
      var input = [1,2,3,4];
      var expected = [2,3,4];
      var a = new ArrayOperation([">>", 0, 2]);
      var b = new ArrayOperation(["-", 0, 1]);

      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected);
    },

    "Transformation: a=Move, b=Delete, a.t == b", function() {
      var input = [1,2,3,4];
      var expected = [2,1,4];
      var a = new ArrayOperation([">>", 0, 2]);
      var b = new ArrayOperation(["-", 2, 3]);

      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected);
    },

    "Transformation: a=Move, b=Insert, a < b", function() {
      var input = [1,2,4];
      var expected = [2,1,3,4];
      var a = new ArrayOperation([">>", 0, 1]);
      var b = new ArrayOperation(["+", 2, 3]);

      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected);
    },

    "Transformation: a=Move, b=Insert, a.s < b < a.t", function() {
      var input = [1,3,4];
      var expected = [2,3,4,1 ];
      var a = new ArrayOperation([">>", 0, 2]);
      var b = new ArrayOperation(["+", 1, 2]);

      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected);
    },

    "Transformation: a=Move, b=Insert, a.t < b < a.s", function() {
      var input = [1,3,4];
      var expected = [4,1,2,3];
      var a = new ArrayOperation([">>", 2, 0]);
      var b = new ArrayOperation(["+", 1, 2]);

      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected);
    },

    "Transformation: a=Move, b=Insert, a.s == b, b < a.t", function() {
      var input = [1,3,4,5];
      var expected = [1,2,4,3,5];
      var a = new ArrayOperation([">>", 1, 2]);
      var b = new ArrayOperation(["+", 1, 2]);

      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected);
    },

    "Transformation: a=Move, b=Insert, a.s < b, b == a.t", function() {
      var input = [1,2,4,5];
      var expected = [1,3,4,2,5];
      var a = new ArrayOperation([">>", 1, 2]);
      var b = new ArrayOperation(["+", 2, 3]);

      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected);
    },

    "Transformation: a=Move, b=Insert, a.t < b, b == a.s", function() {
      var input = [1,2,4,5];
      var expected = [1,4,2,3,5];
      var a = new ArrayOperation([">>", 2, 1]);
      var b = new ArrayOperation(["+", 2, 3]);

      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected);
    },

    "Transformation: a=Move, b=Insert, a.t == b, b < a.s", function() {
      var input = [1,3,4,5];
      var expected = [1,2,4,3,5];
      var a = new ArrayOperation([">>", 2, 1]);
      var b = new ArrayOperation(["+", 1, 2]);

      testTransform(a, b, input, expected);
      testTransform(b, a, input, expected);
    },

    "Brutal merge", function() {
      this.chronicle.open(this.ID4);
      this.ID_M1 = this.chronicle.merge(this.ID6, "manual", {sequence: [this.ID2, this.ID6, this.ID4]});

      this.chronicle.open("ROOT");
      this.chronicle.open(this.ID_M1);
      assert.isArrayEqual(ARR_M1, this.array);
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
    this.chronicle.reset(this.ID1);
    this.ID6 = this.apply(OP_6);
    this.chronicle.reset("ROOT");
  };

};
ArrayOperationTest.prototype = new ArrayOperationTest.__prototype__();

root.Substance.registerTest(['Chronicle', 'Array Operation'], new ArrayOperationTest());

})(this);
