(function(root) {

var assert = root.Substance.assert;
var Chronicle = root.Substance.Chronicle;
var ChronicleTest = root.Substance.test.ChronicleTest;
var ROOT = Chronicle.Index.ROOT.id;
var ot = root.ot;

var TEXT1 = "Lorem amet";
var TEXT2 = "Lorem ipsum amet";
var TEXT3 = "Lorem ipsum dolor amet";
var TEXT4 = "Lorem ipsum dolor sit amet";
var TEXT5 = "Lorem sit amet";
var TEXT_M1 = "Lorem ipsum sit amet";

var OP1 = new ot.TextOperation().insert("Lorem amet"); // (0, 10)
var OP2 = new ot.TextOperation().retain(6).insert("ipsum ").retain(4); // (10, 16)
var OP3 = new ot.TextOperation().retain(12).insert("dolor ").retain(4); // (16, 22)
var OP4 = new ot.TextOperation().retain(18).insert("sit ").retain(4); // (22, 26)
var OP5 = new ot.TextOperation().retain(6).insert("sit ").retain(4); // (10, 14)

// Index:
//
// ROOT - 1 - 2 - 3 - 4
//        |     \
//        |       M1
//          - 5 /
//


var TestDocument;

var TextOperationTest = function() {

  this.actions = [
    "Basic checkout", function() {
      this.chronicle.open(this.ID4);
      assert.isEqual(TEXT4, this.document.getText());

      this.chronicle.open(this.ID1);
      assert.isEqual(TEXT1, this.document.getText());

      this.chronicle.open(this.ID5);
      assert.isEqual(TEXT5, this.document.getText());
    },

    "Merge (simple)", function() {
      this.chronicle.open(this.ID2);
      this.M1 = this.chronicle.merge(this.ID5, "manual", {sequence: [this.ID2, this.ID5]});
      this.chronicle.open(this.M1);
      assert.isEqual(TEXT_M1, this.document.getText());
    },

  ];

};

TextOperationTest.__prototype__ = function() {

  var ID_IDX = 1;

  this.uuid = function() {
    return ""+ID_IDX++;
  };

  this.setup = function() {
    this.ID_IDX = 1;
    Chronicle.HYSTERICAL = true;
    this.index = Chronicle.Index.create();
    this.chronicle = Chronicle.create(this.index);
    Chronicle.uuid = this.uuid;

    this.document = new TestDocument(this.chronicle);
    this.fixture();
  };

  this.fixture = function() {
    this.ID1 = this.document.apply(OP1);
    this.ID2 = this.document.apply(OP2);
    this.ID3 = this.document.apply(OP3);
    this.ID4 = this.document.apply(OP4);
    this.chronicle.open(this.ID1);
    this.ID5 = this.document.apply(OP5);
    this.chronicle.open("ROOT");
  };

};
TextOperationTest.prototype = new TextOperationTest.__prototype__();

// ROOT - 1 - 2 - 3 - 4
var TestDocument = function(chronicle) {
  this.text = "";
  this.chronicle = chronicle;
  chronicle.manage(new Chronicle.TextOperationAdapter(chronicle, this));

  this.setText = function(text) {
    this.text = text;
  };

  this.getText = function() {
    return this.text;
  };

  this.apply = function(op) {
    this.text = op.apply(this.text);
    return this.chronicle.record(op);
  };

};

root.Substance.registerTest(['Chronicle', 'Text Operation'], new TextOperationTest());

})(this);
