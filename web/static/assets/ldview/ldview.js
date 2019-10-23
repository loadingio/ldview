// Generated by LiveScript 1.3.1
(function(){
  var ldView;
  ldView = function(opt){
    var root, selector, exclusions, all, prefixRE, names, i$, ref$, k, v, len$, list, j$, len1$, it, res$, this$ = this;
    opt == null && (opt = {});
    this.handler = opt.handler || {};
    this.action = opt.action || {};
    this.prefix = opt.prefix;
    this.initRender = opt.initRender != null ? opt.initRender : true;
    this.root = root = typeof opt.root === 'string'
      ? ld$.find(document, opt.root, 0)
      : opt.root;
    if (!this.root) {
      console.warn("[ldView] warning: no node found for root ", opt.root);
    }
    if (this.root.setAttribute) {
      this.id = "ld-" + Math.random().toString(36).substring(2);
      this.root.setAttribute("ld-scope-" + this.id, '');
    }
    selector = this.prefix ? "[ld-each^=" + this.prefix + "\\$]" : "[ld-each]";
    exclusions = ld$.find(root, (this.id ? "[ld-scope-" + this.id + "] " : "") + ("[ld-scope] " + selector));
    all = ld$.find(root, selector);
    this.eaches = all.filter(function(it){
      return !in$(it, exclusions);
    }).map(function(n){
      var p, c, i, ret;
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
      if (ld$.parent(n.parentNode, '*[ld-each]', document)) {
        return null;
      }
      c = n.parentNode;
      i = Array.from(c.childNodes).indexOf(n);
      ret = {
        container: c,
        idx: i,
        node: n,
        name: n.getAttribute('ld-each'),
        nodes: []
      };
      p = document.createComment(" ld-each=" + ret.name + " ");
      p._data = ret;
      c.insertBefore(p, n);
      ret.proxy = p;
      c.removeChild(n);
      return ret;
    }).filter(function(it){
      return it;
    });
    selector = this.prefix ? "[ld^=" + this.prefix + "\\$]" : "[ld]";
    exclusions = ld$.find(root, (this.id ? "[ld-scope-" + this.id + "] " : "") + ("[ld-scope] " + selector));
    all = ld$.find(root, selector);
    this.nodes = all.filter(function(it){
      return !in$(it, exclusions);
    });
    prefixRE = this.prefix ? new RegExp("^" + this.prefix + "\\$") : null;
    this.map = {
      nodes: {},
      eaches: {}
    };
    this.nodes.map(function(node){
      var names;
      names = (node.getAttribute('ld') || "").split(' ');
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
    this.eaches.map(function(node){
      var ref$, key$;
      return ((ref$ = this$.map.eaches)[key$ = node.name] || (ref$[key$] = [])).push(node);
    });
    names = {};
    for (i$ = 0, len$ = (ref$ = [(fn$.call(this))].concat((fn1$.call(this)).map(fn2$))).length; i$ < len$; ++i$) {
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
      for (k in this.handler) {
        results$.push(k);
      }
      return results$;
    }
    function fn1$(){
      var ref$, results$ = [];
      for (k in ref$ = this.action) {
        v = ref$[k];
        results$.push(v);
      }
      return results$;
    }
    function fn2$(it){
      var k, results$ = [];
      for (k in it) {
        results$.push(k);
      }
      return results$;
    }
  };
  ldView.prototype = import$(Object.create(Object.prototype), {
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
      lastidx = 0;
      ret = list.map(function(n, i){
        var node;
        if ((lastidx = items.indexOf(n)) >= 0) {
          return nodes[lastidx];
        }
        node = data.node.cloneNode(true);
        node._data = n;
        node.removeAttribute('ld-each');
        data.container.insertBefore(node, nodes[lastidx + 1] || data.proxy);
        return node;
      });
      ns = ret;
      ns.map(function(it){
        return this$.handler[name].handle({
          node: it,
          name: name,
          data: it._data
        });
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
    render: function(names){
      var _, i$, ref$, len$, k, this$ = this, results$ = [];
      _ = function(n){
        if (this$.map.nodes[n]) {
          this$.map.nodes[n].map(function(d, i){
            var k, ref$, v, results$ = [];
            d.name = n;
            d.idx = i;
            if (this$.handler[n]) {
              this$.handler[n](d);
            }
            for (k in ref$ = this$.action) {
              v = ref$[k];
              if (v && v[n] && !(d.evts || (d.evts = {}))[k]) {
                d.node.addEventListener(k, fn$);
                results$.push(d.evts[k] = true);
              }
            }
            return results$;
            function fn$(evt){
              return v[n](import$({
                evt: evt
              }, d));
            }
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
function in$(x, xs){
  var i = -1, l = xs.length >>> 0;
  while (++i < l) if (x === xs[i]) return true;
  return false;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
