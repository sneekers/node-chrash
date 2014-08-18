node-chrash
===========

Chronically-updated Hash

## Usage
```javascript
var Chrash = require('chrash');
var initOptions = {
  polling: 15000, // intervals between updates, in ms
  update: function (existingCache, afterUpdate) {
    var newCache.val = existingCache.val;
    var err = null;

    afterUpdate(err, newCache);
  }
};
var initCallback = function (err, chrashInstance) {
  console.log(chrashInstance.get('val'));
};

Chrash.init(initOptions, initCallback);
```
