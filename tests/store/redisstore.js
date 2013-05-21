(function(root) {

if (!Substance.RedisStore) return;

var impl = {
  setup: function() {
    var settings = {
      scope: "test:redisstore"
    };
    this.store = new Substance.RedisStore(settings);
    this.store.impl.clear();
  }
};
var test = new root.Substance.test.store.Create(impl);
root.Substance.registerTest(["Store", "RedisStore", "Create"], test);

var test = new root.Substance.test.store.Update(impl);
root.Substance.registerTest(["Store", "RedisStore", "Update"], test);

var test = new root.Substance.test.store.Commits(impl);
root.Substance.registerTest(["Store", "RedisStore", "Commits"], test);

})(this);
