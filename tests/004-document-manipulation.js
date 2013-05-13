(function(root) {

var test = {};

test.id = '004-document-manipulation';
test.name = 'Document Manipulation';
test.category = 'Document';

test.seeds = ['002-some-docs'];

// Empty document
var doc;

test.actions = [
  "Initialize empty document", function() {
    doc = new Substance.Document({"id": "substance-doc"});
  },

  "Create heading", function() {
    var op = [
      "insert",
      {
        "id": "heading:1",
        "type": "heading",
        "target": "back",
        "data": {
          "content": "Heading 1"
        }
      }
    ];

    doc.apply(op);
  },

  "Create text element", function() {
    var op = [
      "insert",
      {
        "id": "text:1",
        "type": "text",
        "target": "heading:1",
        "data": {
          "content": "Text 1"
        }
      }
    ];

    doc.apply(op);
  },

  "Create some more text elements", function() {

    var op1 = [
      "insert",
      {
        "id": "text:2",
        "type": "text",
        "target": "front",
        "data": {
          "content": "Text 2"
        }
      }
    ];

    var op2 = [
      "insert",
      {
        "id": "text:3",
        "type": "text",
        "target": "back",
        "data": {
          "content": "Text 3"
        }
      }
    ];

    doc.apply(op1);
    doc.apply(op2);
  },

  "Verify populated doc", function() {
    assert.isTrue(_.isEqual(doc.views.content, ["text:2", "heading:1", "text:1", "text:3"]));
  },

  "Move operation", function() {
    var op = [
      "move",
      {
        "nodes": ["text:2", "heading:1"],
        "target": "text:1"
      }
    ];

    doc.apply(op);
    assert.isTrue(_.isEqual(doc.views["content"], ["text:1", "text:2", "heading:1", "text:3"]));
  },

  "Create a new comment", function() {
    var op = [
      "insert",
      {
        "id": "comment:1",
        "type": "comment",
        "data": {
          "node": "text:1",
          "content": "Comment 1"
        }
      }
    ];

    doc.apply(op);
  },


  "Create a new annotation", function() {
    var op = [
      "insert",
      {
        "id": "annotation:1",
        "type": "idea",
        "data": {
          "node": "text:1",
          "pos": [1, 4]
        }
      }
    ];

    // Create a comment that sticks on the
    var op2 = [
      "insert",
      {
        "id": "comment:2",
        "type": "comment",
        "data": {
          "node": "annotation:1",
          "content": "Hello world"
        }
      }
    ];

    doc.apply(op);
    doc.apply(op2);
  },

  "Test indexes", function() {

    // Get comments for text:1
    var comments = doc.find("comments", "text:1");
    assert.equal(comments.length, 1);
    assert.equal(comments[0].id, "comment:1");

    // Get annotations for text:1
    var annotations = doc.find("annotations", "text:1");
    assert.equal(annotations.length, 1);
    assert.equal(annotations[0].id, "annotation:1");

    // Get comments for annotation:1
    var comments = doc.find("comments", "annotation:1");
    assert.equal(comments.length, 1);
    assert.equal(comments[0].id, "comment:2");

  },

  "Delete some comments", function() {
    var op = [
      "delete",
      {
        "nodes": ["comment:1", "comment:2"]
      }
    ];

    // Delete element, then check indexes again
    doc.apply(op);

    // Get comments for annotation:1
    var comments = doc.find("comments", "annotation:1");
    assert.equal(comments.length, 0);
  },

  "Iteration", function() {
    var count = 0;
    doc.each(function(element) {
      count++;
    });

    assert.equal(count, 4);
  },

  "Update Annotation", function() {
    var op = [
      "update",
      {
        "id": "annotation:1",
        "type": "idea",
        "data": {
          "node": "text:2"
        }
      }
    ];

    doc.apply(op);

    // Annotation no longer sticks on text:1
    var annotations = doc.find('annotations', 'text:1');
    assert.equal(annotations.length, 0);

    // Should be returned when querying for annotations, text:2
    var annotations = doc.find('annotations', 'text:2');
    assert.equal(annotations.length, 1);
  },

  "OT Updates for multiple properties", function() {
    var op = [
      "insert",
      {
        "id": "comment:3",
        "type": "comment",
        "data": {
          "node": "text:2",
          "content": "Doe"
        }
      }
    ];

    var op2 = [
      "update",
      {
        "id": "comment:3",
        "data": {
          "content": ["John ", 3]
        }
      }
    ];

    doc.apply(op);
    doc.apply(op2);

    var node = doc.nodes["comment:3"];
    assert.equal(node.content, "John Doe");

  },

  "Support objects as values", function() {

    var op = [
      "update",
      {
        "id": "annotation:1",
        "data": {
          "pos": [1,27]
        }
      }
    ];

    doc.apply(op);

    var node = doc.nodes["annotation:1"];
    assert.isTrue(_.isEqual(node.pos, [1, 27]));
  },
];

root.Substance.registerTest(test);
})(this);
