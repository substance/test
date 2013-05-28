(function(root) {

var Substance = root.Substance;
var seeds = root.Substance.seeds;
var _ = root._;

var MockClient = function(impl) {
  _.extend(this, impl);
};

MockClient.__prototype__ = function() {

  function mock() {
    var cb = _.last(arguments);
    cb(null);
  }

  _.each(Substance.Client.prototype, function(f, name) {
    if(_.isFunction(f)) {
      this[name] = mock;
    }
  }, this);

  this.authenticate = function(name, password, cb) {
    cb(null, {token: "abcd"});
  };

  this.seed = function(seed, cb) {
    var self = this;

    if (_.isString(seed)) {
      return seeds.loadSeedByName(seed, function(err, data) {
        if(err) return cb(err);
        self.seed(data, cb);
      });
    } else {
      _.each(seed.remote, function(docs, scope) {
        var asyncStore = self.getUserStore(scope);
        asyncStore.store.seed(docs);
      });
      cb(null);
    }
  };

};
MockClient.prototype = new MockClient.__prototype__();

Substance.MockClient = MockClient;

})(this);
