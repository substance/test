(function(root) {

var impl = {
  setup: function() {
    this.store = new Substance.MemoryStore();
  }
};
var test = new root.Substance.test.store.Create(impl);
root.Substance.registerTest(["Store", "Memory", "Create"], test);

var test = new root.Substance.test.store.Update(impl);
root.Substance.registerTest(["Store", "Memory", "Update"], test);

var test = new root.Substance.test.store.Commits(impl);
root.Substance.registerTest(["Store", "Memory", "Commits"], test);

})(this);
