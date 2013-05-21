(function(root) {

if (!Substance.LocalStore) return;

var impl = {
  setup: function() {
    this.store = new Substance.LocalStore("test:localstore");
    this.store.impl.clear();
  }
};

_.each(root.Substance.test.store, function(testClass, name) {
  var test = new testClass(impl);
  root.Substance.registerTest(["Store", "LocalStore", name], test);
});

})(this);
