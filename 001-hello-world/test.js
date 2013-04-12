var test = new Substance.Test();
test.actions = [
  ["Say hello", function(test, cb) {
    console.log("Hello World! Test:", test);
    assert.isTrue((1+1)==2);
    assert.equal(1,2);
  }]
];
Substance.tests['001-hello-world'] = test;
