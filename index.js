var Chrash = require('./lib/chrash');

function init(options, callback) {
  options = options || {};
  options.polling = options.polling || 30000;
  if (!options.update) {
    throw new Error('must be initialized with an update function');
  }
  if (!callback) {
    throw new Error('must be provided a callback for initialization');
  }

  var chrash = new Chrash(options);
  var onSuccess = function () {
    clearTimeout(timeout);
    callback(null, chrash);
  };
  var onError = function (err) {
    clearTimeout(timeout);
    callback(err);
  };
  var timeout = setTimeout(function () {
    chrash.removeListener('updated', onSuccess);
    chrash.removeListener('error', onError);
    callback(new Error('initial update timed out'));
  }, options.polling);

  chrash.once('updated', onSuccess);
  chrash.once('error', onError);
};

module.exports = {
  init: init
};
