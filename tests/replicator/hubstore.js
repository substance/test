(function(root) {

var replicationTests = root.Substance.test.replicator;
var without = ["ReplicatorTest"];

_.each(replicationTests, function(f, name) {
  if (without.indexOf(name)>=0) return;
  if (!_.isFunction(f)) return;

  var test = new f();
  test.setup = function() {};
  root.Substance.registerTest(['Replicator (Old)', "HubStore", name], test);
});

})(this);
