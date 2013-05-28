(function(root) {

var Substance = root.Substance;
var assert = root.Substance.assert;
var _ = root._;
var ELIFE_DOCUMENT = root.ELIFE_DOCUMENT;

var test = {};

var SCHEMA = {

  // Views for storing order
  // ------------------

  "views": {
    // Stores order for content nodes
    "content": {},
    "figures": {},
    "publications": {},
    "info": {}
  },

  // Dynamic Indexes
  // ------------------

  "indexes": {

    // index comments by node associations
    "comments": {
      "type": "comment",
      "properties": ["source"]
    },

    // Annotations indexed by source
    "annotations": {
      "type": "annotation",
      "properties": ["source"]
    },

    // Only headings
    "headings": {
      "type": "heading",
      "properties": []
    },

    // Annotations indexed by target
    "reverse_annotations": {
      "type": "annotation",
      "properties": ["target"]
    },

    "figure_references": {
      "type": "figure_reference",
      "properties": ["source"]
    },

    "publication_references": {
      "type": "publication_reference",
      "properties": ["source"]
    }
  },

  "types": {

    // Shared by all content nodes (text, heading, formula)
    // ------------------

    "content": {
      "properties": {}
    },

    // Abstract type shared by all figure types (images, videos, tables, supplments)
    // ------------------

    "figure": {
      "properties": {
        "label": "string",
        "caption": "caption"
      }
    },

    // Formerly references
    // ------------------

    "publication": {
      "properties": {}
    },

    // Person (like authors and editors)
    // ------------------

    "person": {
      "properties": {
        "given-names": "string",
        "last-name": "string",
        "affiliations": "object",
        "image": "string",
        "contribution": "string"
      }
    },

    // Email (like authors and editors)
    // ------------------

    "email": {
      "properties": {
        "node": "node",
        "email": "string"
      }
    },

    // Cover Node (can be annotated)
    // ------------------

    "cover": {
      "parent": "content",
      "properties": {
        "title": "string",
        "abstract": "string",
        "authors": "object"
      }
    },

    // Heading Node (can be annotated)
    // ------------------

    "heading": {
      "parent": "content",
      "properties": {
        "content": "string"
      }
    },

    // Text Node (can be annotated)
    // ------------------

    "text": {
      "parent": "content",
      "properties": {
        "content": "string"
      }
    },

    // Image
    // ------------------

    "image": {
      "parent": "figure",
      "properties": {
        "large_url": "string",
        "medium_url": "string",
      }
    },

    // Supplement
    // ------------------

    "supplement": {
      "parent": "figure",
      "properties": {}
    },

    // Video
    // ------------------

    "video": {
      "parent": "figure",
      "properties": {
        "poster": "string",
        "url": "string",
        "url_ogv": "string",
      }
    },

    // HTML Table
    // ------------------

    "table": {
      "parent": "figure",
      "properties": {
        "content": "string",
      }
    },

    // Formula (block)
    // ------------------

    "formula": {
      "parent": "content",
      "properties": {
        "label": "string",
        "content": "string"
      }
    },

    // Caption (used by figures, tables)
    // ------------------

    "caption": {
      "properties": {
        "title": "string",
        "content": "string",
        "source": "figure"
      }
    },

    // Abstract Annotation Type
    // ------------------

    "annotation": {
      "properties": {
        "source": "string", // should be type:node
        "key": "string",
        "pos": "object"
      }
    },

    // Text emphasis
    // ------------------

    "emphasis": {
      "parent": "annotation",
      "properties": {},
    },

    // Annotate text as strong
    // ------------------

    "strong": {
      "parent": "annotation",
      "properties": {},
    },

    // Subscript text
    // ------------------

    "subscript": {
      "parent": "annotation",
      "properties": {},
    },

    // Superscript text
    // ------------------

    "superscript": {
      "parent": "annotation",
      "properties": {},
    },

    // HTTP Link
    // ------------------

    "link": {
      "parent": "annotation",
      "properties": {
        "url": "string"
      }
    },

    // Figure Reference (image, table, video)
    // ------------------

    "figure_reference": {
      "parent": "annotation",
      "properties": {
        "target": "figure",
      }
    },

    // Publication Reference
    // ------------------

    "publication_reference": {
      "parent": "annotation",
      "properties": {
        "target": "publication",
      }
    }
  }
};


function convert(eLifeDoc) {
  var doc = new Substance.Document({id: "new-doc"}, SCHEMA);

  function insert(nodeId, view) {
    if (doc.nodes[nodeId]) return; // skip existing nodes
    // Content
    var node = eLifeDoc.nodes[nodeId];
    var data = JSON.parse(JSON.stringify(node));
    delete data.id;
    delete data.type;

    var op = [
      "insert",
      {
        "id": node.id,
        "type": node.type,
        "target": view ? [view, "back"] : null,
        "data": data
      }
    ];
    doc.apply(op);
  }

  _.each(eLifeDoc.views.text.nodes, function(nodeId) {
    insert(nodeId, "content");
  });

  _.each(eLifeDoc.views.info.nodes, function(nodeId) {
    insert(nodeId, "info");
  });

  // Pull in author nodes
  _.each(eLifeDoc.nodes, function(node) {
    if (node.type === "person") {
      insert(node.id);
    } else if (node.type === "figure") {
      node.type = node.content_type;
      insert(node.id, "figures");
    } else if (node.type === "reference") {
      // Hack!
      node.type = "publication";
      insert(node.id, "publications");
    } else if (node.type === "caption") {
      insert(node.id);
    }
  });

  _.each(eLifeDoc.annotations, function(node) {
    var type = node.type;
    if (type === "em") type = "emphasis";
    if (type === "sub") type = "subscript";
    if (type === "sup") type = "superscript";
    if (type === "reference") type = "publication_reference";
    if (type === "figure") type = "figure_reference";

    var op = [
      "insert",
      {
        "id": node.id,
        "type": type,
        "data": {
          "source": node.source,
          "key": node.key,
          "target": node.target,
          "pos": node.pos
        }
      }
    ];

    doc.apply(op);
  });

  return doc;
}


test.actions = [

  "Import eLife document", function() {
    var doc = convert(ELIFE_DOCUMENT);

    var figrefs = doc.find('figure_references', 'text:854');
    assert.equal(figrefs.length, 2);
  }

];

root.Substance.registerTest(['Document', 'Custom Document Schema'], test);

})(this);
