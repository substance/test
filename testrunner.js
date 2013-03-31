var index = 0;
var args = [];


var funcs = window.test_case;

function process(data) {
  var func = funcs[index];
  if (!func) return;
  var cb = function(err, data) {
    if (err) throw err;
    index += 1;
    process(data);
  };

  func(data, cb);
}

process(null);