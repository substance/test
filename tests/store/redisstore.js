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

_.each(root.Substance.test.store, function(testClass, name) {
  var test = new testClass(impl);
  root.Substance.registerTest(["Store", "RedisStore", name], test);
});

})(this);
