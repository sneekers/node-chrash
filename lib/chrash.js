var events = require('events');
var util = require('util');

var Chrash = function (params) {
  events.EventEmitter.call(this);
  this.polling = params.polling; // default half min poll
  this._cache = {}; // the update-able cache
  this._bindUpdate(params.update);
};

util.inherits(Chrash, events.EventEmitter);

Chrash.prototype._bindUpdate = function (updateFunction) {
  var self = this;
  var onUpdate = function (err, newCache) {
    if (err) {
      self.emit('error', err);
    } else {
      self._cache = newCache;
      self.emit('updated');
    }
    delete self._updating;
  };
  var onFirstUpdate = function (err, newCache) {
    onUpdate(err, newCache);
    delete self._firstCall;
    self._nextCall = setTimeout(onNextUpdate, self.polling);
  };
  var onNextUpdate = function () {
    if (!self._updating) {
      self._updating = true;
      updateFunction(self._cache, onUpdate);
    }
    self._nextCall = setTimeout(onNextUpdate, self.polling);
  };

  self._firstCall = setImmediate(function () {
    updateFunction(self._cache, onFirstUpdate);
  });
};

/**
 * getter for the hash
 * @param  {String} key to retrieve value for
 * @return {Any}    value tied to key
 */
Chrash.prototype.get = function (key) {
  return this._cache[key];
};

/**
 * stop the updates
 */
Chrash.prototype.stop = function () {
  if (this._firstCall) {
    clearImmediate(this._firstCall);
  }
  if (this._nextCall) {
    clearTimeout(this._nextCall);
  }
  delete this._updating;
  this.emit('stopped');
};

module.exports = Chrash;
