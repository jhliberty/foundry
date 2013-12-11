// Load in dependencies
var childProcess = require('child_process');
var sinon = require('sinon');

// Stop exec calls from happening
var shell = require('shelljs');
var originalExec = shell.exec;
shell.exec = shell.complaintExec = function () {
  throw new Error('`shell.exec` was being called with ' + JSON.stringify(arguments));
};

// Stop childProcess exec and spawn calls too unless people opt in to our methods
exports.iKnowWhatIAmDoingSpawn = childProcess.spawn;
childProcess.spawn = childProcess.complaintSpawn = function () {
  throw new Error('`childProcess.spawn` was being called with ' + JSON.stringify(arguments));
};
exports.iKnowWhatIAmDoingExec = childProcess.exec;
childProcess.exec = childProcess.complaintExec = function () {
  throw new Error('`childProcess.exec` was being called with ' + JSON.stringify(arguments));
};

exports.shellExec = {
  stub: function stubShellExec () {
    before(function () {
      this.execStub = sinon.stub(shell, 'exec', function () {
        return {};
      });
    });
    after(function () {
      this.execStub.restore();
    });
  },
  _allow: function () {
    shell.exec = originalExec;
  },
  _ban: function () {
    shell.exec = shell.complaintExec;
  },
  allow: function allowShellExec (fn, cb) {
    this._allow();
    fn(function (err) {
      this._ban();
      cb(err);
    });
  },
  allowDuring: function (obj, key) {
    // Outside of fn/before running (banned) ->
    // Inside of fn (allowed) ->
    // Outside of fn/inside callback (banned)
    var origFn = obj[key];
    obj[key] = function newFn (/* args, ..., cb*/) {
      // Save references to args and that
      var args = [].slice.call(arguments);
      var that = this;

      // TODO: Need to enable childProcess.exec as well
      // Enable .exec until callback is run
      var cb = args.pop();
      exports.shellExec._allow();
      args.push(function boundCallback (/* args */) {
        // Re-ban before the callback
        exports.shellExec._ban();

        // Restore the original function
        obj[key] = origFn;

        // Apply the original callback
        cb.apply(this, arguments);
      });

      // Run the original function
      return origFn.apply(this, args);
    };
  }
};

exports.childExec = {
  allow: function allowChildExec(fn, cb) {
    childProcess.exec = exports.iKnowWhatIAmDoingExec;
    fn(function (err) {
      childProcess.exec = childProcess.complaintExec;
      cb(err);
    });
  }
};
