(function(){
  var setEvtHandler, ldview;
  setEvtHandler = function(d, k, f){
    return d.node.addEventListener(k, function(evt){
      return f(import$({
        evt: evt
      }, d));
    });
  };
  ldview = function(opt){
    var names, i$, ref$, k, v, len$, list, j$, len1$, it, res$, this$ = this;
    opt == null && (opt = {});
    if (arguments.length > 1) {
      opt = ldview.merge.apply(ldview, Array.from(arguments));
    }
    this.evtHandler = {};
    this._ctxs = opt.ctxs || null;
    this.views = [this].concat(opt.baseViews || []);
    this._ctx = opt.context || opt.ctx || null;
    if (opt.context) {
      console.warn('[ldview] `context` is deprecated. use `ctx` instead.');
    }
    this.attr = opt.attr || {};
    this.style = opt.style || {};
    this.handler = opt.handler || {};
    this.action = opt.action || {};
    this.text = opt.text || {};
    this.initer = opt.init || {};
    this.prefix = opt.prefix;
    this.global = opt.global || false;
    this.ld = this.global ? 'pd' : 'ld';
    this.initRender = opt.initRender != null ? opt.initRender : true;
    this.root = typeof opt.root === 'string'
      ? ld$.find(document, opt.root, 0)
      : opt.root;
    if (!this.root) {
      console.warn("[ldview] warning: no node found for root ", opt.root);
    }
    if (this.root.setAttribute && !this.global) {
      this.id = "ld-" + Math.random().toString(36).substring(2);
      this.root.setAttribute("ld-scope-" + this.id, '');
    }
    if (this.template = opt.template) {
      this.root.textContent = '';
      this.root.appendChild(this.template.cloneNode(true));
    }
    this.update();
    names = {};
    for (i$ = 0, len$ = (ref$ = [(fn$.call(this))].concat([(fn1$.call(this))], [(fn2$.call(this))], [(fn3$.call(this))], [(fn4$.call(this))], (fn5$.call(this)).map(fn6$))).length; i$ < len$; ++i$) {
      list = ref$[i$];
      for (j$ = 0, len1$ = list.length; j$ < len1$; ++j$) {
        it = list[j$];
        names[it] = true;
      }
    }
    res$ = [];
    for (k in names) {
      res$.push(k);
    }
    this.names = res$;
    if (this.initRender) {
      this.init().then(function(){
        return this$.render();
      });
    }
    return this;
    function fn$(){
      var results$ = [];
      for (k in this.initer) {
        results$.push(k);
      }
      return results$;
    }
    function fn1$(){
      var results$ = [];
      for (k in this.attr) {
        results$.push(k);
      }
      return results$;
    }
    function fn2$(){
      var results$ = [];
      for (k in this.style) {
        results$.push(k);
      }
      return results$;
    }
    function fn3$(){
      var results$ = [];
      for (k in this.text) {
        results$.push(k);
      }
      return results$;
    }
    function fn4$(){
      var results$ = [];
      for (k in this.handler) {
        results$.push(k);
      }
      return results$;
    }
    function fn5$(){
      var ref$, results$ = [];
      for (k in ref$ = this.action) {
        v = ref$[k];
        results$.push(v);
      }
      return results$;
    }
    function fn6$(it){
      var k, results$ = [];
      for (k in it) {
        results$.push(k);
      }
      return results$;
    }
  };
  ldview.prototype = import$(Object.create(Object.prototype), {
    update: function(root){
      var selector, exclusions, all, eachesNodes, eaches, nodes, prefixRE, this$ = this;
      root == null && (root = this.root);
      if (!this.nodes) {
        this.nodes = [];
      }
      if (!this.eaches) {
        this.eaches = [];
      }
      if (!this.map) {
        this.map = {
          nodes: {},
          eaches: {}
        };
      }
      selector = this.prefix
        ? "[" + this.ld + "-each^=" + this.prefix + "\\$]"
        : "[" + this.ld + "-each]";
      exclusions = this.global
        ? []
        : ld$.find(root, (this.id ? "[ld-scope-" + this.id + "] " : "") + ("[ld-scope] " + selector));
      all = ld$.find(root, selector);
      eachesNodes = this.eaches.map(function(it){
        return it.n;
      });
      eaches = all.filter(function(it){
        return !in$(it, exclusions);
      }).filter(function(it){
        return !in$(it, eachesNodes);
      }).map(function(n){
        var e, name, c, i, ret, p, that;
        if (!n.parentNode) {
          return null;
        }
        try {
          if (ld$.parent(n.parentNode, "*[" + this$.ld + "-each]")) {
            return null;
          }
        } catch (e$) {
          e = e$;
        }
        name = n.getAttribute(this$.ld + "-each");
        if (!this$.handler[name]) {
          return null;
        }
        c = n.parentNode;
        i = Array.from(c.childNodes).indexOf(n);
        ret = {
          idx: i,
          node: n,
          name: name,
          nodes: []
        };
        p = document.createComment(" " + this$.ld + "-each=" + name + " ");
        if (!this$.handler[name].host) {
          c.insertBefore(p, n);
        }
        c.removeChild(n);
        p._data = ret;
        ret.proxy = p;
        ret.container = (that = this$.handler[name].host) ? new that({
          root: c
        }) : c;
        return ret;
      }).filter(function(it){
        return it;
      });
      this.eaches = this.eaches.concat(eaches);
      eaches.map(function(node){
        var ref$, key$;
        return ((ref$ = this$.map.eaches)[key$ = node.name] || (ref$[key$] = [])).push(node);
      });
      selector = this.prefix
        ? "[" + this.ld + "^=" + this.prefix + "\\$]"
        : "[" + this.ld + "]";
      exclusions = this.global
        ? []
        : ld$.find(root, (this.id ? "[ld-scope-" + this.id + "] " : "") + ("[ld-scope] " + selector));
      all = ld$.find(root, selector);
      nodes = all.filter(function(it){
        return !(in$(it, exclusions) || in$(it, this$.nodes));
      });
      this.nodes = this.nodes.concat(nodes);
      prefixRE = this.prefix ? new RegExp("^" + this.prefix + "\\$") : null;
      nodes.map(function(node){
        var names;
        names = (node.getAttribute(this$.ld) || "").split(' ');
        if (this$.prefix) {
          names = names.map(function(it){
            return it.replace(prefixRE, "").trim();
          });
        }
        return names.map(function(it){
          var ref$;
          return ((ref$ = this$.map.nodes)[it] || (ref$[it] = [])).push({
            node: node,
            names: names,
            local: {},
            evts: {}
          });
        });
      });
      if (!this.map.nodes['@']) {
        return this.map.nodes['@'] = [{
          node: this.root,
          names: '@',
          local: {},
          evts: {}
        }];
      }
    },
    procEach: function(name, data, key, initOnly){
      var c, list, getkey, keycount, items, usekey, nodes, proxyIndex, ns, consumed, i$, i, n, k, j, node, idx, expectedIdx, _, ps, this$ = this;
      key == null && (key = null);
      c = typeof this._ctx === 'function'
        ? this._ctx({
          node: this.root,
          ctxs: this._ctxs,
          views: this.views
        })
        : this._ctx;
      list = this.handler[name].list({
        name: data.name,
        node: data.node,
        views: this.views,
        context: c,
        ctx: c,
        ctxs: this._ctxs
      }) || [];
      getkey = this.handler[name].key;
      keycount = {};
      items = [];
      usekey = !!getkey;
      if (!getkey) {
        getkey = function(it){
          return it;
        };
      } else {
        list.map(function(n){
          var k;
          if (typeof (k = getkey(n)) === 'object') {
            return;
          }
          return keycount[k] = (keycount[k] || 0) + 1;
        });
      }
      nodes = data.nodes.filter(function(it){
        return it;
      }).map(function(n){
        var k;
        k = getkey(n._data);
        if ((typeof k !== 'object' && !usekey) || (typeof k === 'object' && !in$(n._data, list)) || (usekey && !keycount[k])) {
          data.container.removeChild(n);
          delete n._data;
        } else {
          items.push(k);
          if (usekey && keycount[k]) {
            keycount[k]--;
          }
        }
        return n;
      }).filter(function(it){
        return it._data != null;
      });
      proxyIndex = Array.from(data.container.childNodes).indexOf(data.proxy);
      if (proxyIndex < 0) {
        proxyIndex = data.container.childNodes.length;
      }
      ns = [];
      consumed = {};
      for (i$ = list.length - 1; i$ >= 0; --i$) {
        i = i$;
        n = list[i];
        k = getkey(n);
        if (usekey && typeof k !== 'object') {
          consumed[k] = (consumed[k] || 0) + 1;
        }
        if ((j = items.indexOf(k)) >= 0) {
          node = nodes[j];
          items.splice(j, 1);
          nodes.splice(j, 1);
          node._data = n;
          if (!node._obj) {
            node._obj = {
              node: node,
              name: name,
              idx: i,
              local: {}
            };
          }
          node._obj.data = n;
          idx = Array.from(data.container.childNodes).indexOf(node);
          expectedIdx = proxyIndex - (list.length - i);
          if (idx !== expectedIdx) {
            data.container.removeChild(node);
            proxyIndex = Array.from(data.container.childNodes).indexOf(data.proxy);
            if (proxyIndex < 0) {
              proxyIndex = data.container.childNodes.length;
            }
            expectedIdx = proxyIndex - (list.length - i);
            data.container.insertBefore(node, data.container.childNodes[expectedIdx + 1]);
            proxyIndex = proxyIndex + 1;
          }
          ns.splice(0, 0, node);
          continue;
        }
        if (usekey && typeof k !== 'object') {
          if (consumed[k] > 1) {
            continue;
          }
        }
        node = data.node.cloneNode(true);
        node._data = n;
        node._obj = {
          node: node,
          name: name,
          data: n,
          idx: i,
          local: {}
        };
        node.removeAttribute(this.ld + "-each");
        expectedIdx = proxyIndex - (list.length - i);
        data.container.insertBefore(node, data.container.childNodes[expectedIdx + 1]);
        proxyIndex = proxyIndex + 1;
        ns.splice(0, 0, node);
      }
      _ = ns.filter(function(it){
        return it;
      });
      if (key != null) {
        _ = _.filter(function(it){
          return in$(getkey(it._obj.data), key);
        });
      }
      ps = _.map(function(it, i){
        return this$._render(name, it._obj, i, this$.handler[name], true, initOnly);
      });
      if (data.container.update) {
        data.container.update();
      }
      data.nodes = ns;
      return Promise.all(ps);
    },
    get: function(n){
      return ((this.map.nodes[n] || [])[0] || {}).node;
    },
    getAll: function(n){
      return (this.map.nodes[n] || []).map(function(it){
        return it.node;
      });
    },
    _render: function(n, d, i, b, e, initOnly){
      var c, init, handler, text, attr, style, action, ref$, k, v, f, results$ = [];
      c = typeof this._ctx === 'function'
        ? c = this._ctx({
          node: this.root,
          ctxs: this._ctxs,
          views: this.views
        })
        : this._ctx;
      d.ctx = c;
      d.context = c;
      d.ctxs = this._ctxs;
      d.views = this.views;
      if (b) {
        if (b.view) {
          init = function(arg$){
            var node, local, data, ctx, ctxs, views, ref$;
            node = arg$.node, local = arg$.local, data = arg$.data, ctx = arg$.ctx, ctxs = arg$.ctxs, views = arg$.views;
            local._view = new ldview((ref$ = import$({
              ctx: data
            }, b.view), ref$.initRender = false, ref$.root = node, ref$.baseViews = views, ref$.ctxs = ctxs
              ? [ctx].concat(ctxs)
              : [ctx], ref$));
            return local._view.init();
          };
          handler = function(arg$){
            var local, data, ctx, ctxs;
            local = arg$.local, data = arg$.data, ctx = arg$.ctx, ctxs = arg$.ctxs;
            if (e) {
              local._view.ctx(data);
            }
            local._view.ctxs(ctxs
              ? [ctx].concat(ctxs)
              : [ctx]);
            return local._view.render();
          };
        } else {
          init = b.init || null;
          handler = b.handler || b.handle || null;
          text = b.text || null;
          attr = b.attr || null;
          style = b.style || null;
          action = b.action || {};
        }
      } else {
        ref$ = [this.initer[n], this.handler[n], this.attr[n], this.style[n], this.text[n], this.action], init = ref$[0], handler = ref$[1], attr = ref$[2], style = ref$[3], text = ref$[4], action = ref$[5];
      }
      try {
        if (init && !(d.inited || (d.inited = {}))[n]) {
          d.inited[n] = Promise.resolve(init(d)).then(function(){
            return d.inited[n] = true;
          });
        }
        if (initOnly) {
          return Promise.resolve((d.inited || (d.inited = {}))[n]);
        }
        if (handler) {
          handler(d);
        }
        if (text) {
          d.node.textContent = typeof text === 'function' ? text(d) : text;
        }
        if (attr) {
          for (k in ref$ = attr(d) || {}) {
            v = ref$[k];
            d.node.setAttribute(k, v);
          }
        }
        if (style) {
          for (k in ref$ = style(d) || {}) {
            v = ref$[k];
            d.node.style[k] = v;
          }
        }
        for (k in ref$ = action || {}) {
          v = ref$[k];
          if (!v || !((f = b
            ? v
            : v[n]) && !(d.evts || (d.evts = {}))[k])) {
            continue;
          }
          setEvtHandler(d, k, f);
          results$.push(d.evts[k] = true);
        }
        return results$;
      } catch (e$) {
        e = e$;
        console.warn("[ldview] failed when rendering " + n + ":", e);
        throw e;
      }
    },
    bindEachNode: function(arg$){
      var name, container, idx, node, obj;
      name = arg$.name, container = arg$.container, idx = arg$.idx, node = arg$.node;
      if (!(obj = this.map.eaches[name].filter(function(it){
        return it.container === container;
      })[0])) {
        return;
      }
      if (idx != null) {
        return obj.nodes.splice(idx, 0, node);
      } else {
        return obj.nodes.push(node);
      }
    },
    unbindEachNode: function(arg$){
      var name, container, idx, node, obj;
      name = arg$.name, container = arg$.container, idx = arg$.idx, node = arg$.node;
      if (!(obj = this.map.eaches[name].filter(function(it){
        return it.container === container;
      })[0])) {
        return;
      }
      if (node && !idx) {
        idx = obj.nodes.indexOf(node);
      }
      return obj.nodes.splice(idx, 1);
    },
    init: function(names){
      var args, res$, i$, to$;
      res$ = [];
      for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {
        res$.push(arguments[i$]);
      }
      args = res$;
      return this._prerender('init', names, args);
    },
    render: function(names){
      var args, res$, i$, to$;
      res$ = [];
      for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {
        res$.push(arguments[i$]);
      }
      args = res$;
      return this._prerender('render', names, args);
    },
    _prerender: function(type, names, args){
      var initOnly, _, ps, k, this$ = this;
      initOnly = type === 'init';
      this.fire('beforeRender');
      _ = function(n){
        var ps, ref$, key;
        ps = [];
        if (typeof n === 'object') {
          ref$ = [n.name, n.key], n = ref$[0], key = ref$[1];
          if (!Array.isArray(key)) {
            key = [key];
          }
        }
        if (this$.map.nodes[n]) {
          ps = ps.concat(this$.map.nodes[n].map(function(d, i){
            d.name = n;
            d.idx = i;
            return this$._render(n, d, i, typeof this$.handler[n] === 'object' ? {
              view: this$.handler[n]
            } : null, false, initOnly);
          }));
        }
        if (this$.map.eaches[n] && this$.handler[n]) {
          ps = ps.concat(this$.map.eaches[n].map(function(it){
            return this$.procEach(n, it, key, initOnly);
          }));
        }
        return Promise.all(ps);
      };
      ps = names
        ? ((Array.isArray(names)
          ? names
          : [names]).concat(args)).map(function(it){
          return _(it);
        })
        : (function(){
          var i$, ref$, len$, results$ = [];
          for (i$ = 0, len$ = (ref$ = this.names).length; i$ < len$; ++i$) {
            k = ref$[i$];
            results$.push(_(k));
          }
          return results$;
        }.call(this));
      this.fire('afterRender');
      return Promise.all(ps);
    },
    setContext: function(v){
      console.warn('[ldview] `setContext` is deprecated. use `ctx(...)` instead.');
      return this._ctx = v;
    },
    setCtx: function(v){
      console.warn('[ldview] `setCtx` is deprecated. use `ctx(...)` instead.');
      return this._ctx = v;
    },
    ctx: function(v){
      if (arguments.length) {
        return this._ctx = v;
      } else {
        return this._ctx;
      }
    },
    ctxs: function(v){
      if (arguments.length) {
        return this._ctxs = v;
      } else {
        return this._ctxs;
      }
    },
    on: function(n, cb){
      var ref$;
      return ((ref$ = this.evtHandler)[n] || (ref$[n] = [])).push(cb);
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
    }
  });
  ldview.merge = function(){
    return ldview._merge.apply(ldview, [{}].concat(Array.from(arguments)));
  };
  ldview._merge = function(){
    var list, a, i$, len$, b, k;
    list = Array.from(arguments);
    if (list.length < 2) {
      return list[0];
    }
    a = list.splice(0, 1)[0];
    for (i$ = 0, len$ = list.length; i$ < len$; ++i$) {
      b = list[i$];
      for (k in b) {
        if (!b[k]) {
          continue;
        }
        if (typeof b[k] === 'object' && b[k].constructor === Object) {
          ldview._merge(a[k] || (a[k] = {}), b[k]);
        } else {
          a[k] = b[k];
        }
      }
    }
    return a;
  };
  if (typeof module != 'undefined' && module !== null) {
    module.exports = ldview;
  }
  if (typeof window != 'undefined' && window !== null) {
    window.ldView = window.ldview = ldview;
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
