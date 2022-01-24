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
    this.ph = [0, 1].map(function(){
      return document.createElement('div');
    }).map(function(it){
      var ref$;
      ref$ = it.style;
      ref$.width = '100%';
      ref$.height = '0px';
      ref$.gridColumn = "1 / -1";
      return this$.root.appendChild(it);
    });
    this.root.addEventListener('scroll', function(){
      return this$.locate();
    });
    return this.rbox = {
      height: 0
    };
  }, ref$.setchild = function(it){
    var tpl;
    tpl = document.createElement('template');
    tpl.innerHTML = it;
    this.childNodes = Array.from(tpl.content.childNodes);
    this.root.innerHTML = '';
    if (!this.ph[0].parentNode) {
      this.root.insertBefore(this.ph[0], this.root.childNodes[0]);
    }
    if (!this.ph[1].parentNode) {
      return this.root.appendChild(this.ph[1]);
    }
  }, ref$.update = function(probeLen){
    var ref$, ref1$, i$, to$, i, len, rbox, y, box;
    probeLen == null && (probeLen = 0);
    this.range = [1, 0];
    this.row = 1;
    this.count = 1;
    this.range[0] = (ref$ = this.range[0]) < (ref1$ = this.childNodes.length - 1) ? ref$ : ref1$;
    this.range[1] = (ref$ = this.range[1]) < (ref1$ = this.childNodes.length - 1) ? ref$ : ref1$;
    for (i$ = 0, to$ = this.childNodes.length; i$ < to$; ++i$) {
      i = i$;
      if (this.childNodes[i].parentNode) {
        this.childNodes[i].parentNode.removeChild(this.childNodes[i]);
      }
    }
    len = (ref$ = probeLen || this.childNodes.length) < (ref1$ = this.childNodes.length) ? ref$ : ref1$;
    for (i$ = 0; i$ < len; ++i$) {
      i = i$;
      if (!this.childNodes[i].parentNode) {
        this.root.insertBefore(this.childNodes[i], this.ph[1]);
      }
    }
    this.ph[0].style.height = this.ph[1].style.height = "0px";
    this.root.scrollTop = 0;
    this.rbox = rbox = this.root.getBoundingClientRect();
    y = undefined;
    for (i$ = 0; i$ < len; ++i$) {
      i = i$;
      if (this.childNodes[i].nodeType !== Node.ELEMENT_NODE) {
        continue;
      }
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
    /*
    # can merge with above.
    # we dont seem to need this, since row can be infered based on rbox.height and @line-height below.
    # remove it once we confirm this.
    for i from 0 til len =>
      if @childNodes[i].nodeType != Node.ELEMENT_NODE => continue
      box = @childNodes[i].getBoundingClientRect!
      if (box.y - rbox.y) <= rbox.height * 4 => continue
      @row = (Math.ceil(i / @count) >? 1)
      break
    */
    this.row = Math.ceil((rbox.height * 4) / (this.lineHeight || 1));
    this.delta = (ref$ = this.row * this.count) > 1 ? ref$ : 1;
    for (i$ = 0; i$ < len; ++i$) {
      i = i$;
      this.childNodes[i].parentNode.removeChild(this.childNodes[i]);
    }
    return this.locate();
  }, ref$.locate = function(){
    var ref$, len, delta, count, nodes, lh, root, ph, rbox, range, min, max, i$, i, j, ref1$, b1, b2;
    ref$ = [this.childNodes.length, this.delta, this.count, this.childNodes, this.lineHeight, this.root, this.ph, this.rbox, this.range], len = ref$[0], delta = ref$[1], count = ref$[2], nodes = ref$[3], lh = ref$[4], root = ref$[5], ph = ref$[6], rbox = ref$[7], range = ref$[8];
    if (!ph[0].parentNode) {
      root.insertBefore(ph[0], root.childNodes[0]);
    }
    if (!ph[1].parentNode) {
      root.appendChild(ph[1]);
    }
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
        nodes[i].parentNode.removeChild(nodes[i]);
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
        nodes[i].parentNode.removeChild(nodes[i]);
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
