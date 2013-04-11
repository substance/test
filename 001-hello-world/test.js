Substance.test.type = 'composer';
Substance.test.actions = [
  ["Say hello", function(test, cb) {
    console.log("Hello World! Test:",test);
    assertTrue((1+1)==2, cb);
    assertTrue((1+1)==3, cb);
  }]
];
