// Generated by LiveScript 1.3.1
(function(){
  var setEvtHandler, ldView;
  setEvtHandler = function(d, k, f){
    return d.node.addEventListener(k, function(evt){
      return f(import$({
        evt: evt
      }, d));
    });
  };
  ldView = function(opt){
    var names, i$, ref$, k, v, len$, list, j$, len1$, it, res$;
    opt == null && (opt = {});
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
      console.warn("[ldView] warning: no node found for root ", opt.root);
    }
    if (this.root.setAttribute && !this.global) {
      this.id = "ld-" + Math.random().toString(36).substring(2);
      this.root.setAttribute("ld-scope-" + this.id, '');
    }
    this.update();
    names = {};
    for (i$ = 0, len$ = (ref$ = [(fn$.call(this))].concat([(fn1$.call(this))], [(fn2$.call(this))], (fn3$.call(this)).map(fn4$))).length; i$ < len$; ++i$) {
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
      this.render();
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
      for (k in this.text) {
        results$.push(k);
      }
      return results$;
    }
    function fn2$(){
      var results$ = [];
      for (k in this.handler) {
        results$.push(k);
      }
      return results$;
    }
    function fn3$(){
      var ref$, results$ = [];
      for (k in ref$ = this.action) {
        v = ref$[k];
        results$.push(v);
      }
      return results$;
    }
    function fn4$(it){
      var k, results$ = [];
      for (k in it) {
        results$.push(k);
      }
      return results$;
    }
  };
  ldView.prototype = import$(Object.create(Object.prototype), {
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
        var p, name, c, i, ret;
        p = n.parentNode;
        while (p) {
          if (p === document) {
            break;
          } else {
            p = p.parentNode;
          }
        }
        if (!p) {
          return null;
        }
        if (ld$.parent(n.parentNode, "*[" + this$.ld + "-each]", document)) {
          return null;
        }
        name = n.getAttribute(this$.ld + "-each");
        if (!this$.handler[name]) {
          return null;
        }
        c = n.parentNode;
        i = Array.from(c.childNodes).indexOf(n);
        ret = {
          container: c,
          idx: i,
          node: n,
          name: name,
          nodes: []
        };
        p = document.createComment(" " + this$.ld + "-each=" + ret.name + " ");
        p._data = ret;
        c.insertBefore(p, n);
        ret.proxy = p;
        c.removeChild(n);
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
      return nodes.map(function(node){
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
            evts: {}
          });
        });
      });
    },
    procEach: function(name, data){
      var list, items, nodes, lastidx, ret, ns, this$ = this;
      list = this.handler[name].list() || [];
      items = [];
      nodes = data.nodes.filter(function(it){
        return it;
      }).map(function(n){
        if (!in$(n._data, list)) {
          if (n.parentNode) {
            n.parentNode.removeChild(n);
          }
          n._data = null;
        } else {
          items.push(n._data);
        }
        return n;
      }).filter(function(it){
        return it._data;
      });
      lastidx = -1;
      ret = list.map(function(n, i){
        var j, node;
        if ((j = items.indexOf(n)) >= 0) {
          return nodes[lastidx = j];
        }
        node = data.node.cloneNode(true);
        node._data = n;
        node._obj = {
          node: node,
          name: name,
          data: n,
          idx: i
        };
        node.removeAttribute(this$.ld + "-each");
        data.container.insertBefore(node, nodes[lastidx + 1] || data.proxy);
        return node;
      });
      ns = ret;
      ns.filter(function(it){
        return it;
      }).map(function(it, i){
        return this$._render(name, it._obj, i, this$.handler[name]);
      });
      return data.nodes = ns;
    },
    get: function(n){
      return ((this.map.nodes[n] || [])[0] || {}).node;
    },
    getAll: function(n){
      return (this.map.nodes[n] || []).map(function(it){
        return it.node;
      });
    },
    _render: function(n, d, i, b){
      var init, handler, text, action, ref$, k, v, f, e, results$ = [];
      if (b) {
        init = b.init || null;
        handler = b.handler || b.handle || null;
        text = b.text || null;
        action = b.action || {};
      } else {
        ref$ = [this.initer[n], this.handler[n], this.text[n], this.action], init = ref$[0], handler = ref$[1], text = ref$[2], action = ref$[3];
      }
      try {
        if (handler) {
          handler(d);
        }
        if (text) {
          d.node.textContent = typeof text === 'function' ? text(d) : text;
        }
        if (init && !(d.inited || (d.inited = {}))[n]) {
          init(d);
          d.inited[n] = true;
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
        console.warn("[ldView] failed when rendering " + n);
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
    render: function(names){
      var _, i$, ref$, len$, k, this$ = this, results$ = [];
      _ = function(n){
        if (this$.map.nodes[n]) {
          this$.map.nodes[n].map(function(d, i){
            d.name = n;
            d.idx = i;
            return this$._render(n, d, i);
          });
        }
        if (this$.map.eaches[n] && this$.handler[n]) {
          return this$.map.eaches[n].map(function(it){
            return this$.procEach(n, it);
          });
        }
      };
      if (names) {
        return (Array.isArray(names)
          ? names
          : [names]).map(function(it){
          return _(it);
        });
      } else {
        for (i$ = 0, len$ = (ref$ = this.names).length; i$ < len$; ++i$) {
          k = ref$[i$];
          results$.push(_(k));
        }
        return results$;
      }
    }
  });
  if (typeof module != 'undefined' && module !== null) {
    module.exports = ldView;
  }
  if (typeof window != 'undefined' && window !== null) {
    return window.ldView = ldView;
  }
})();
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
