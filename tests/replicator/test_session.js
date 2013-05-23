(function(root) {

var TestSession = function() {

  this.localStores = new TestSession.UserStores(this, "test:local");
  this.remoteStores = new TestSession.UserStores(this, "test:remote");

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

  this.createStore = function(scope) {

    if (TestSession.useLocalStorage) {
      return new Substance.LocalStore(scope);
    }

    return new Substance.MemoryStore();
  }
}


TestSession.UserStores = function(factory, scope) {
  this.userStores = {};

  this.getUserStore = function(username) {

    if(!this.userStores[username]) {
      this.userStores[username] = factory.createStore(scope+":"+username);
    }

    return this.userStores[username];
  }
}

TestSession.useLocalStorage = false;

root.Substance.test.TestSession = TestSession;

})(this);
