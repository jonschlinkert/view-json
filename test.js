'use strict';

require('mocha');
var assert = require('assert');
var App = require('templates');
var json = require('./');
var app;

describe('view-json', function() {
  beforeEach(function() {
    app = new App();
    app.use(json());
    app.create('files');
    app.file('package.json', '{"name": "foo"}');
  });

  describe('plugin', function() {
    it('should export a function', function() {
      assert.equal(typeof json, 'function');
    });

    it('should expose a json property on view', function() {
      var view = app.files.getView('package.json');
      assert.equal(typeof view.json, 'object');
    });

    it('should not expose a json property when extname is not json', function() {
      app.file('foo', {content: 'this is content'});
      var view = app.files.getView('foo');
      assert.equal(typeof view.json, 'undefined');
    });

    it('should expose a json property when view.options.json is true', function() {
      app.file('bar', {content: '{"name": "bar"}', options: {json: true}});
      var view = app.files.getView('bar');
      assert.equal(typeof view.json, 'object');
      assert.equal(view.json.data.name, 'bar');
    });

    it('should expose a json.set method on view', function() {
      var view = app.files.getView('package.json');
      assert.equal(typeof view.json.set, 'function');
    });

    it('should expose a json.get method on view', function() {
      var view = app.files.getView('package.json');
      assert.equal(typeof view.json.get, 'function');
    });

    it('should expose a json.merge method on view', function() {
      var view = app.files.getView('package.json');
      assert.equal(typeof view.json.merge, 'function');
    });
  });

  describe('set', function() {
    it('should set a value on `view.json.data`', function() {
      var view = app.files.getView('package.json');
      view.json.set('description', 'this is a package.json');
      assert.equal(view.json.data.description, 'this is a package.json');
    });

    it('should set a nested value on `view.json.data`', function() {
      var view = app.files.getView('package.json');
      view.json.set('a.b.c', 'foo');
      assert.equal(view.json.data.a.b.c, 'foo');
    });

    it('should update view.content when view.set is called', function() {
      var view = app.files.getView('package.json');
      view.json.set('description', 'this is a package.json');
      assert.equal(view.content, '{"name":"foo","description":"this is a package.json"}');
    });
  });

  describe('get', function() {
    it('should get a value from `view.json.data`', function() {
      var view = app.files.getView('package.json');
      view.json.set('description', 'this is a package.json');
      assert.equal(view.json.get('description'), 'this is a package.json');
      assert.equal(view.json.get('name'), 'foo');
    });

    it('should update view.data when view.content has changed since last set', function() {
      var view = app.files.getView('package.json');
      view.json.set('name', 'abc');
      assert.equal(view.content, '{"name":"abc"}');
      view.content = '{"name":"xyz"}';
      assert.equal(view.json.get('name'), 'xyz');
      assert.equal(view.json.data.name, 'xyz');
    });
  });

  describe('merge', function() {
    it('should merge values onto `view.json.data`', function() {
      var view = app.files.getView('package.json');
      view.json.merge({a: 'b'});
      view.json.merge({c: 'd'});
      assert.equal(view.json.data.a, 'b');
      assert.equal(view.json.data.c, 'd');
    });

    it('should merge a list of values onto `view.json.data`', function() {
      var view = app.files.getView('package.json');
      view.json.data = {};
      view.json.merge({a: 'b'}, {c: 'd'});
      assert.equal(view.json.data.a, 'b');
      assert.equal(view.json.data.c, 'd');
    });

    it('should merge an array of values onto `view.json.data`', function() {
      var view = app.files.getView('package.json');
      view.json.data = {};
      view.json.merge([{a: 'b'}, {c: 'd'}]);
      assert.equal(view.json.data.a, 'b');
      assert.equal(view.json.data.c, 'd');
    });
  });
});
