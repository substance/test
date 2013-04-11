Substance.test.type = 'composer';
Substance.test.actions = [
  ["Say hello", function(test, cb) {
    console.log("Hello World");
    test.assertTrue((1+1)==2, cb);
    test.assertTrue((1+1)==3, cb);
  }]
];
