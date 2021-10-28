(function(){
  var vscroll, ref$;
  vscroll = {};
  vscroll.fixed = function(opt){
    opt == null && (opt = {});
    this.root = opt.root;
    this.childNodes = Array.from(this.root.childNodes);
    this.init();
    return this;
  };
  vscroll.fixed.prototype = (ref$ = Object.create(Object.prototype), ref$.init = function(){
    var this$ = this;
    this.range = [1, 0];
    this.row = 1;
    this.count = 1;
    this.ph = [0, 1].map(function(){
      return document.createElement('div');
    }).map(function(it){
      var ref$;
      ref$ = it.style;
      ref$.width = '100%';
      ref$.height = '0px';
      return this$.root.appendChild(it);
    });
    this.root.addEventListener('scroll', function(){
      return this$.handler();
    });
    return this.rbox = {
      height: 0
    };
  }, ref$.update = function(){
    var ref$, ref1$, i$, to$, i, y, box;
    this.rbox = this.root.getBoundingClientRect();
    this.row = 0;
    this.count = 1;
    this.range[0] = (ref$ = this.range[0]) < (ref1$ = this.childNodes.length - 1) ? ref$ : ref1$;
    this.range[1] = (ref$ = this.range[1]) < (ref1$ = this.childNodes.length - 1) ? ref$ : ref1$;
    for (i$ = 0, to$ = (ref$ = this.childNodes.length) < 100 ? ref$ : 100; i$ < to$; ++i$) {
      i = i$;
      if (!this.childNodes[i].parentNode) {
        this.root.insertBefore(this.childNodes[i], this.ph[1]);
      }
    }
    y = undefined;
    for (i$ = 0, to$ = this.childNodes.length; i$ < to$; ++i$) {
      i = i$;
      box = this.childNodes[i].getBoundingClientRect();
      this.lineHeight = box.height;
      if (!(y != null)) {
        y = box.y;
      } else if (box.y === y) {
        this.count++;
      } else {
        this.lineHeight = box.y - y;
        break;
      }
    }
    for (i$ = 0, to$ = this.childNodes.length; i$ < to$; ++i$) {
      i = i$;
      box = this.childNodes[i].getBoundingClientRect();
      if (box.y <= this.rbox.height * 4) {
        continue;
      }
      this.row = (ref$ = Math.ceil(i / this.count)) > 1 ? ref$ : 1;
      break;
    }
    this.delta = (ref$ = this.row * this.count) > 1 ? ref$ : 1;
    this.childNodes.map(function(it){
      if (it.parentNode) {
        return it.parentNode.removeChild(it);
      }
    });
    return this.handler();
  }, ref$.handler = function(){
    var ref$, len, delta, count, nodes, lh, root, ph, rbox, range, min, max, i$, i, j, ref1$, b1, b2;
    ref$ = [this.childNodes.length, this.delta, this.count, this.childNodes, this.lineHeight, this.root, this.ph, this.rbox, this.range], len = ref$[0], delta = ref$[1], count = ref$[2], nodes = ref$[3], lh = ref$[4], root = ref$[5], ph = ref$[6], rbox = ref$[7], range = ref$[8];
    ref$ = [len, -1], min = ref$[0], max = ref$[1];
    for (i$ = 0; delta < 0 ? i$ > len : i$ < len; i$ += delta) {
      i = i$;
      j = (ref$ = i + delta - 1) < (ref1$ = nodes.length - 1) ? ref$ : ref1$;
      b1 = {
        y: (i / count) * lh,
        height: lh
      };
      b2 = {
        y: (j / count) * lh,
        height: lh
      };
      if (b1.y - root.scrollTop <= 1.5 * rbox.height && b2.y + b2.height - root.scrollTop > -0.5 * rbox.height) {
        if (i < min) {
          min = i;
        }
        if (j > max) {
          max = j;
        }
      }
    }
    if (root.scrollTop > root.scrollHeight / 2 && min === len && max === -1) {
      ref$ = [delta * Math.floor(len / delta), len - 1], min = ref$[0], max = ref$[1];
    }
    for (i$ = (ref$ = range[0]) > 0 ? ref$ : 0; i$ < min; ++i$) {
      i = i$;
      if (nodes[i].parentNode) {
        root.removeChild(nodes[i]);
      }
    }
    for (i$ = range[0] - 1; i$ >= min; --i$) {
      i = i$;
      if (!nodes[i].parentNode) {
        root.insertBefore(nodes[i], ph[0].nextSibling);
      }
    }
    for (i$ = range[1]; i$ > max; --i$) {
      i = i$;
      if (nodes[i].parentNode) {
        root.removeChild(nodes[i]);
      }
    }
    for (i$ = range[1] + 1; i$ <= max; ++i$) {
      i = i$;
      if (!nodes[i].parentNode) {
        root.insertBefore(nodes[i], ph[1]);
      }
    }
    this.range = [min, max];
    ph[0].style.height = lh * ((ref$ = min / count) > 0 ? ref$ : 0) + "px";
    return ph[1].style.height = lh * Math.floor((len - max - 1) / count) + "px";
  }, ref$.appendChild = function(n){
    return this.childNodes.splice(this.childNodes.length, 0, n);
  }, ref$.insertBefore = function(n, s){
    var idx;
    idx = this.childNodes.indexOf(s);
    if (idx < 0) {
      idx = this.childNodes.length;
    }
    return this.childNodes.splice(idx, 0, n);
  }, ref$.removeChild = function(n){
    var idx;
    if (!~(idx = this.childNodes.indexOf(n))) {
      return;
    }
    return this.childNodes.splice(idx, 1);
  }, ref$);
  vscroll.dummy = function(opt){
    opt == null && (opt = {});
    this.root = opt.root;
    this.childNodes = [];
    return this;
  };
  vscroll.dummy.prototype = (ref$ = Object.create(Object.prototype), ref$.appendChild = function(n){
    this.childNodes.splice(this.childNodes.length, 0, n);
    return this.root.appendChild(n);
  }, ref$.insertBefore = function(n, s){
    this.childNodes.splice(this.childNodes.indexOf(s), 0, n);
    return this.root.insertBefore(n, s);
  }, ref$.removeChild = function(n){
    var idx;
    if (!~(idx = this.childNodes.indexOf(n))) {
      return;
    }
    this.childNodes.splice(idx, 1);
    return this.root.removeChild(n);
  }, ref$);
  if (typeof module != 'undefined' && module !== null) {
    module.exports = vscroll;
  } else if (typeof window != 'undefined' && window !== null) {
    window.vscroll = vscroll;
  }
}).call(this);
