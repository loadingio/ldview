(function(){
  var ldreactive;
  ldreactive = function(data, options){
    options == null && (options = {});
    if (!(this instanceof ldreactive)) {
      return new ldreactive(data, options);
    }
    this._ = {};
    this._.exclude = options.exclude || [];
    this._.computed = options.computed || {};
    this._.deps = {};
    this._.tracking = null;
    this._.trackingPath = [];
    this._.currentDeps = null;
    this._.proxy = null;
    this._.proxyCache = new WeakMap();
    this._.watchers = {};
    this._.batchMode = false;
    this._.pendingChanges = [];
    this._.data = null;
    this.evtHandler = {};
    if (data != null) {
      this.set(data);
    }
    return this;
  };
  ldreactive.create = function(data, options){
    return new ldreactive(data, options);
  };
  ldreactive.prototype = import$(Object.create(Object.prototype), {
    on: function(n, cb){
      var this$ = this;
      (Array.isArray(n)
        ? n
        : [n]).map(function(n){
        var ref$;
        return ((ref$ = this$.evtHandler)[n] || (ref$[n] = [])).push(cb);
      });
      return this;
    },
    fire: function(n){
      var v, res$, i$, to$, ref$, len$, cb, results$ = [];
      res$ = [];
      for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {
        res$.push(arguments[i$]);
      }
      v = res$;
      for (i$ = 0, len$ = (ref$ = this.evtHandler[n] || []).length; i$ < len$; ++i$) {
        cb = ref$[i$];
        results$.push(cb.apply(this, v));
      }
      return results$;
    },
    set: function(data){
      this._.data = data;
      this._.proxy = null;
      this._.proxyCache = new WeakMap();
      this.fire('set', data);
      return this;
    },
    get: function(){
      if (!this._.proxy && this._.data) {
        this._.proxy = this._createProxy(this._.data, []);
      }
      return this._.proxy;
    },
    raw: function(){
      return this._.data;
    },
    track: function(name, fn){
      var prevTracking, prevDeps, result, deps, i$, len$, dep;
      prevTracking = this._.tracking;
      prevDeps = this._.currentDeps;
      this._.tracking = name;
      this._.currentDeps = new Set();
      try {
        result = fn();
      } finally {
        deps = Array.from(this._.currentDeps);
        this._.tracking = prevTracking;
        this._.currentDeps = prevDeps;
      }
      for (i$ = 0, len$ = deps.length; i$ < len$; ++i$) {
        dep = deps[i$];
        if (!this._.deps[dep]) {
          this._.deps[dep] = new Set();
        }
        this._.deps[dep].add(name);
      }
      this.fire('track', name, deps);
      return deps;
    },
    untrack: function(name){
      var key, ref$, handlers;
      for (key in ref$ = this._.deps) {
        handlers = ref$[key];
        handlers['delete'](name);
      }
      return this;
    },
    watch: function(key, callback){
      if (!this._.watchers[key]) {
        this._.watchers[key] = [];
      }
      this._.watchers[key].push(callback);
      return this;
    },
    batch: function(fn){
      var prev;
      prev = this._.batchMode;
      this._.batchMode = true;
      try {
        fn();
      } finally {
        this._.batchMode = prev;
        this._flushChanges();
      }
      return this;
    },
    _createProxy: function(obj, path){
      var proxy, self;
      if (typeof obj !== 'object' || !obj) {
        return obj;
      }
      if (path.length && in$(path[0], this._.exclude)) {
        return obj;
      }
      if (this._.proxyCache.has(obj)) {
        return this._.proxyCache.get(obj);
      }
      if (Array.isArray(obj)) {
        proxy = this._createArrayProxy(obj, path);
        this._.proxyCache.set(obj, proxy);
        return proxy;
      }
      self = this;
      proxy = new Proxy(obj, {
        get: function(target, key){
          var fullPath, value;
          if (typeof key === 'symbol' || key.toString().startsWith('_') || key === 'constructor') {
            return Reflect.get(target, key);
          }
          fullPath = path.length
            ? path.join('.') + "." + key
            : key.toString();
          if (self._.tracking && self._.currentDeps) {
            self._.currentDeps.add(fullPath);
          }
          value = Reflect.get(target, key);
          if (typeof value === 'object' && value !== null) {
            return self._createProxy(value, path.concat([key]));
          } else {
            return value;
          }
        },
        set: function(target, key, value){
          var oldValue, result, fullPath;
          oldValue = target[key];
          result = Reflect.set(target, key, value);
          if (oldValue !== value) {
            fullPath = path.length
              ? path.join('.') + "." + key
              : key.toString();
            self._trigger(fullPath, value, oldValue);
          }
          return result;
        }
      });
      this._.proxyCache.set(obj, proxy);
      return proxy;
    },
    _createArrayProxy: function(arr, path){
      var self, proxy;
      self = this;
      proxy = new Proxy(arr, {
        get: function(target, key){
          var fullPath, value;
          if (key === 'push' || key === 'pop' || key === 'shift' || key === 'unshift' || key === 'splice' || key === 'sort' || key === 'reverse') {
            return function(){
              var args, res$, i$, to$, result, fullPath;
              res$ = [];
              for (i$ = 0, to$ = arguments.length; i$ < to$; ++i$) {
                res$.push(arguments[i$]);
              }
              args = res$;
              result = target[key].apply(target, args);
              fullPath = path.length ? path.join('.') : 'root';
              self._trigger(fullPath, target, target);
              return result;
            };
          }
          if (!isNaN(parseInt(key))) {
            fullPath = path.length
              ? path.join('.') + "." + key
              : key.toString();
            if (self._.tracking && self._.currentDeps) {
              self._.currentDeps.add(fullPath);
            }
          }
          value = Reflect.get(target, key);
          if (typeof value === 'object' && value !== null) {
            return self._createProxy(value, path.concat([key]));
          } else {
            return value;
          }
        },
        set: function(target, key, value){
          var oldValue, result, fullPath;
          oldValue = target[key];
          result = Reflect.set(target, key, value);
          if (oldValue !== value) {
            fullPath = path.length
              ? path.join('.') + "." + key
              : key.toString();
            self._trigger(fullPath, value, oldValue);
          }
          return result;
        }
      });
      this._.proxyCache.set(arr, proxy);
      return proxy;
    },
    _trigger: function(key, value, oldValue){
      var dependents, i$, ref$, len$, cb;
      dependents = Array.from(this._.deps[key] || []);
      for (i$ = 0, len$ = (ref$ = this._.watchers[key] || []).length; i$ < len$; ++i$) {
        cb = ref$[i$];
        cb.call(this, value, oldValue);
      }
      if (this._.batchMode) {
        this._.pendingChanges.push({
          key: key,
          value: value,
          oldValue: oldValue,
          dependents: dependents
        });
      } else {
        this.fire('change', key, value, oldValue, dependents);
      }
      return this;
    },
    _flushChanges: function(){
      var allDependents, i$, ref$, len$, change, j$, ref1$, len1$, dep;
      if (!this._.pendingChanges.length) {
        return;
      }
      allDependents = new Set();
      for (i$ = 0, len$ = (ref$ = this._.pendingChanges).length; i$ < len$; ++i$) {
        change = ref$[i$];
        for (j$ = 0, len1$ = (ref1$ = change.dependents).length; j$ < len1$; ++j$) {
          dep = ref1$[j$];
          allDependents.add(dep);
        }
      }
      this.fire('batch-change', this._.pendingChanges, Array.from(allDependents));
      this._.pendingChanges = [];
      return this;
    }
  });
  if (typeof module != 'undefined' && module !== null) {
    module.exports = ldreactive;
  }
  if (typeof window != 'undefined' && window !== null) {
    window.ldreactive = ldreactive;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
  function in$(x, xs){
    var i = -1, l = xs.length >>> 0;
    while (++i < l) if (x === xs[i]) return true;
    return false;
  }
}).call(this);
