(function(root) {

var test = {}

test.id = '007-replicate-empty-doc';
test.name = 'Replicate Empty Doc';
test.category = 'Replicator';

test.seeds = ['002-some-docs'];

test.actions = [
  "Login", function(cb) {
    session.authenticate("michael", "abcd", cb);
  },

  "Create another doc", function() {
    session.localStore.create('hello');
  },

  "Push empty doc", function(cb) {
    session.replicate(cb);
  },

  "Pull empy again", function(cb) {
    session.replicate(cb);
  }
];

root.Substance.registerTest(test);
})(this);
