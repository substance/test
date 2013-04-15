var test = new Substance.Test();

test.seeds = ['002-some-docs'];
test.defaultType = "composer";

test.actions = [
  ["composer", "Login", function(data, cb) {
    session.authenticate("michael", "abcd", cb);

  }],
  ["composer", "Say hello", function(test, cb) {
    // Check if there are some docs from the seed
    var docs = localStore.list();
    assert.isTrue(docs.length > 0);


    cb(null, docs.length);
  }],

  ["composer", "Create another doc", function(docCount, cb) {
    localStore.create('hello');
    assert.equal(docCount+1, localStore.list().length);
    cb(null);
  }],

  ["composer", "Replicate with se hub", function(docCount, cb) {
    var replicator = new Substance.Replicator({store: localStore, user: "michael"});
    replicator.sync(cb);
  }],

  ["composer", "After sync check", function(docCount, cb) {
    console.log('DID WE COME HERE?');
    cb(null);
  }]
];

Substance.tests['001-hello-world'] = test;