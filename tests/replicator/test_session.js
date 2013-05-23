(function(root) {

var TestSession = function() {

  this.localStores = new TestSession.UserStores(this);
  this.remoteStores = new TestSession.UserStores(this);

  this.getUserStore = function(username) {
    return this.localStores.getUserStore(username);
  }

  this.getClient = function() {
    var self = this;

    return new Substance.MockClient({
      getUserStore: function(username) {
        return new Substance.AsyncStore(self.remoteStores.getUserStore(username));
      }
    });
  }

  // Store factory
  // ----

  this.createStore = function() {
    return new Substance.MemoryStore();
  }
}

TestSession.UserStores = function(factory) {
  this.userStores = {};

  this.getUserStore = function(username) {

    if(!this.userStores[username]) {
      this.userStores[username] = factory.createStore(username);
    }

    return this.userStores[username];
  }
}

root.Substance.test.TestSession = TestSession;

})(this);
