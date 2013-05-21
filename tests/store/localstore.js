(function(root) {

if (!Substance.LocalStore) return;

var impl = {
  setup: function() {
    this.store = new Substance.LocalStore("test:localstore");
    this.store.impl.clear();
  }
};
var test = new root.Substance.test.store.Create(impl);
root.Substance.registerTest(["Store", "LocalStore", "Create"], test);

var test = new root.Substance.test.store.Update(impl);
root.Substance.registerTest(["Store", "LocalStore", "Update"], test);

var test = new root.Substance.test.store.Commits(impl);
root.Substance.registerTest(["Store", "LocalStore", "Commits"], test);

})(this);
