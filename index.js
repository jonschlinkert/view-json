/*!
 * view-json <https://github.com/jonschlinkert/view-json>
 *
 * Copyright (c) 2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var set = require('set-value');
var get = require('get-value');
var merge = require('mixin-deep');

module.exports = function(options) {
  return function plugin(file) {
    if (file.isRegistered('view-json')) return;

    // if `file` is an instance of app or collection,
    // return the plugin until we get to `file`
    if (!file.isView && !file.isItem && !file._isVinyl) {
      return plugin;
    }

    if (file.options.json !== true && file.extname !== '.json') {
      return;
    }

    file.json = new Cache();

    function Cache() {
      this.content = file.content;
      this.data = file.json || tryParse(this.content);
    }

    Cache.prototype.set = function() {
      set.bind(null, this.data).apply(this, arguments);
      this.content = file.content = JSON.stringify(this.data);
      return this;
    };

    Cache.prototype.get = function() {
      if (file.content !== this.content) {
        this.content = file.content;
        this.data = tryParse(file.content);
      }
      return get.bind(null, this.data).apply(this, arguments);
    };

    Cache.prototype.merge = function() {
      var args = [].concat.apply([], [].slice.call(arguments));
      this.data = merge.apply(null, [{}, this.data].concat(args));
      this.content = file.content = JSON.stringify(this.data);
      return this;
    };
  };
};

function tryParse(str) {
  try {
    return JSON.parse(str);
  } catch (err) {}
  return {};
}
