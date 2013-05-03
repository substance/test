var test = {};

test.id = '004-document-manipulation';
test.name = 'Document Manipulation';
test.category = 'Document';

test.seeds = ['002-some-docs'];

// Empty document
var doc;

test.actions = [
  "Initialize empty document", function(data, cb) {
    doc = new Substance.Document({"id": "substance-doc"});
    cb(null);
  },

  "Create heading", function(data, cb) {
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

    cb(null);
  },

  "Create text element", function(data, cb) {
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


    cb(null);
  },

  "Create some more text elements", function(data, cb) {

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

    cb(null);
  },

  "Verify populated doc", function(data, cb) {
    assert.isTrue(_.isEqual(doc.views.content, ["text:2", "heading:1", "text:1", "text:3"]));
    cb(null);
  },

  "Move operation", function(data, cb) {
    var op = [
      "move",
      {
        "nodes": ["text:2", "heading:1"],
        "target": "text:1"
      }
    ];

    doc.apply(op);
    assert.isTrue(_.isEqual(doc.views["content"], ["text:1", "text:2", "heading:1", "text:3"]));
    cb(null);
  },

  "Create a new comment", function(data, cb) {
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
    cb(null);
  },


  "Create a new annotation", function(data, cb) {
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
    cb(null);
  },

  "Test indexes", function(data, cb) {

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

    cb(null);

  },

  "Delete some comments", function(data, cb) {
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
    cb(null);
  },

  "Iteration", function(data, cb) {
    var count = 0;
    doc.each(function(element) {
      count++;
    });

    assert.equal(count, 4);

    cb(null);
  },

  "Update Annotation", function(data, cb) {
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

    cb(null);
  },

  "OT Updates for multiple properties", function(data, cb) {
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

    cb(null);
  },

  "Support objects as values", function(data, cb) {

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
    cb(null);
  },
];

Substance.registerTest(test);