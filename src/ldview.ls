set-evt-handler = (d,k,f) -> d.node.addEventListener k, (evt) -> f({evt} <<< d)

ldview = (opt = {}) ->
  @evt-handler = {}

  # configs only for internal usage
  @ctxs = opt.ctxs or null
  @views = [@] ++ (opt.base-views or [])

  @ctx = opt.context or opt.ctx or null
  if opt.context => console.warn '[ldview] `context` is deprecated. use `ctx` instead.'
  @attr = opt.attr or {}
  @style = opt.style or {}
  @handler = opt.handler or {}
  @action = opt.action or {}
  @text = opt.text or {}
  @initer = opt.init or {}
  @prefix = opt.prefix
  @global = opt.global or false
  @ld = if @global => \pd else \ld
  @init-render = if opt.init-render? => opt.init-render else true
  @root = if typeof(opt.root) == \string => ld$.find(document, opt.root, 0) else opt.root
  if !@root => console.warn "[ldview] warning: no node found for root ", opt.root
  # some roots such as document don't support setAttribute. yet document doesn't need scope, too.
  if @root.setAttribute and !@global =>
    @id = "ld-#{Math.random!toString(36)substring(2)}"
    # ld-scope-${id} is used to identify a ldview object, for code of excluding scoped object
    @root.setAttribute "ld-scope-#{@id}", ''
  if (@template = opt.template) =>
    @root.textContent = ''
    @root.appendChild @template.cloneNode(true)

  @update!

  names = {}
  for list in ([[k for k of @initer]] ++ [[k for k of @attr]] ++ [[k for k of @style]] ++ [[k for k of @text]] ++ [[k for k of @handler]] ++ [v for k,v of @action].map (it) -> [k for k of it]) =>
    for it in list => names[it] = true
  @names = [k for k of names]
  if @init-render => @render!
  @

ldview.prototype = Object.create(Object.prototype) <<< do
  # update nodes
  update: (root = @root) ->
    if !@nodes => @nodes = []
    if !@eaches => @eaches = []
    if !@map => @map = nodes: {}, eaches: {}
    # now we are going to find *[ld]. yet, we want to exclude all that are scoped.
    # this can be done by ":scope :not([ld-scope]) [ld], :scope > [ld]"
    # but IE/Edge don't support :scope ( https://caniuse.com/#search=%3Ascope )
    # so we manually exclude them.
    # following is for [ld-each]; we will take care of [ld] later.
    selector = if @prefix => "[#{@ld}-each^=#{@prefix}\\$]" else "[#{@ld}-each]"
    # querySelector returns all nodes that matches the selector, even if some rule are above / in parent of root.
    # so, we use a ld-root to trap the rule inside.
    exclusions = if @global => []
    else ld$.find(root, (if @id => "[ld-scope-#{@id}] " else "") + "[ld-scope] #selector")
    all = ld$.find(root, selector)
    # remove all ld-each by orders.
    eaches-nodes = @eaches.map -> it.n
    eaches = all
      .filter -> !(it in exclusions)
      .filter -> !(it in eaches-nodes)
      .map (n) ~>
        # not sure why we look up the ancestor,
        # but this make ld-each fails when DOM tree is not attached in the document
        # it seems that we only need to check direct parent.
        # remove following code after ensuring no side effect.
        #p = n.parentNode
        #while p => if p == document => break else p = p.parentNode
        #if !p => return null
        if !n.parentNode => return null

        # there is a bug in ldquery <= 2.2.0 which may cause exception when calling ld$.parent without boundary node.
        # but we have to remove boundary node for this check to work
        # so we catch this and simply let it go, since there is no such parent if the error happens.
        # this try catch can be removed in future major release as a breaking change
        try
          if ld$.parent(n.parentNode, "*[#{@ld}-each]") => return null
        catch e
        name = n.getAttribute("#{@ld}-each")
        if !@handler[name] => return null
        c = n.parentNode
        i = Array.from(c.childNodes).indexOf(n)
        ret = { idx: i, node: n, name: name, nodes: [] }
        p = document.createComment " #{@ld}-each=#{name} "
        if !@handler[name].host => c.insertBefore p, n
        c.removeChild n
        p._data = ret
        ret.proxy = p
        ret.container = if @handler[name].host => new that(root: c) else c
        return ret
      .filter -> it
    # TODO
    # we should check if nodes in @eaches are still ld-each labeled.
    # but updating label after initializing rarely happens so we ignore it right now.
    @eaches = @eaches ++ eaches
    eaches.map (node) ~> @map.eaches[][node.name].push node

    # now here is for [ld]
    selector = if @prefix => "[#{@ld}^=#{@prefix}\\$]" else "[#{@ld}]"
    exclusions = if @global => []
    else ld$.find(root, (if @id => "[ld-scope-#{@id}] " else "") + "[ld-scope] #selector")
    all = ld$.find(root, selector)
    nodes = all.filter ~> !((it in exclusions) or (it in @nodes))
    @nodes = @nodes ++ nodes

    prefixRE = if @prefix => new RegExp("^#{@prefix}\\$") else null
    nodes.map (node) ~>
      names = (node.getAttribute(@ld) or "").split(' ')
      if @prefix => names = names.map -> it.replace(prefixRE,"").trim!
      names.map ~> @map.nodes[][it].push {node, names, local: {}, evts: {}}
    if !@map.nodes['@'] => @map.nodes['@'] = [{node: @root, names: '@', local: {}, evts: {}}]

    # TODO
    # we should remove nodes from @map if they are updated and have ld/ld-each attribute removed.
    # yet this rarely happens at least for now so we skip this.

  #data = {container, idx, node, name, nodes, proxy}
  # node._data = item in list
  # container is either a node or a virtual-container, for rendering optimization
  proc-each: (name, data, key = null) ->
    list = @handler[name].list({
      name: data.name, node: data.node, views: @views
      context: @ctx, ctx: @ctx, ctxs: @ctxs
    }) or []
    getkey = @handler[name].key
    hash = {}
    items = []
    if getkey => list.map(-> hash[getkey(it)] = it) else getkey = (->it)
    nodes = data.nodes
      .filter(->it)
      .map (n) ->
        k = getkey(n._data)
        if (typeof(k) != \object and !hash[k]) or (typeof(k) == \object and !(n._data in list))  =>
          data.container.removeChild n
          n._data = null
        else
          items.push k
        n
      .filter (._data)
    proxy-index = Array.from(data.container.childNodes).indexOf(data.proxy)
    if proxy-index < 0 => proxy-index = data.container.childNodes.length
    ns = []
    for i from list.length - 1 to 0 by -1 =>
      n = list[i]
      if (j = items.indexOf(getkey(n))) >= 0 =>
        node = nodes[j]
        node._data = n
        if !node._obj => node._obj = {node, name, idx: i, local: {}}
        node._obj.data = n
        idx = Array.from(data.container.childNodes).indexOf(node)
        expected-idx = proxy-index - (list.length - i)
        if idx != expected-idx =>
          data.container.removeChild node
          proxy-index = Array.from(data.container.childNodes).indexOf(data.proxy)
          if proxy-index < 0 => proxy-index = data.container.childNodes.length
          expected-idx = proxy-index - (list.length - i)
          data.container.insertBefore node, data.container.childNodes[expected-idx + 1]
          proxy-index = proxy-index + 1
        ns.splice 0, 0, node
        continue
      node = data.node.cloneNode true
      node._data = n
      node._obj = {node, name, data: n, idx: i, local: {}}
      node.removeAttribute "#{@ld}-each"
      expected-idx = proxy-index - (list.length - i)
      data.container.insertBefore node, data.container.childNodes[expected-idx + 1]
      proxy-index = proxy-index + 1
      ns.splice 0, 0, node
    _ = ns.filter(->it)
    if key? => _ = _.filter -> getkey(it._obj.data) in key
    _.map (it,i) ~> @_render name, it._obj, i, @handler[name], true
    if data.container.update => data.container.update!
    data.nodes = ns

  get: (n) -> ((@map.nodes[n] or []).0 or {}).node
  getAll: (n) -> (@map.nodes[n] or []).map -> it.node
  # n: node
  # d: data
  # i: index. not a reliable information, since for `ld` it's order from query. deprecate it and remove?
  # b: base handling class. will be local object for repeat items, otherwise is null
  # e: true if from each
  _render: (n,d,i,b,e) ->
    d <<< {ctx: @ctx, context: @ctx, ctxs: @ctxs, views: @views}
    if b =>
      if b.view =>
        init = ({node,local,data,ctx,ctxs,views}) ->
          local._view = new ldview({ctx: data} <<< b.view <<< {
            init-render: false, root: node, base-views: views
            ctxs: (if ctxs => [ctx] ++ ctxs else [ctx])
          })
        handler = ({local,data}) ->
          if e => local._view.setCtx(data)
          local._view.render!
      else
        init = b.init or null
        # handle is deprecated.
        handler = b.handler or b.handle or null
        text = b.text or null
        attr = b.attr or null
        style = b.style or null
        action = b.action or {}
    else [init,handler,attr,style,text,action] = [@initer[n], @handler[n], @attr[n], @style[n], @text[n], @action]
    try
      if init and !d.{}inited[n] => init(d); d.inited[n] = true
      if handler => handler(d)
      if text => d.node.textContent = if typeof(text) == \function => text(d) else text
      if attr => for k,v of (attr(d) or {}) => d.node.setAttribute(k,v)
      if style => for k,v of (style(d) or {}) => d.node.style[k] = v
      for k,v of (action or {}) =>
        if !v or !((f = if b => v else v[n]) and !d.{}evts[k]) => continue
        # scoping so event handler can call v[n]
        set-evt-handler d, k, f
        d.evts[k] = true
    catch e
      console.warn "[ldview] failed when rendering #{n}:", e
      throw e

  bind-each-node: ({name, container, idx, node}) ->
    if !(obj = @map.eaches[name].filter(-> it.container == container).0) => return
    if idx? => obj.nodes.splice(idx, 0, node) else obj.nodes.push node

  unbind-each-node: ({name, container, idx, node}) ->
    if !(obj = @map.eaches[name].filter(-> it.container == container).0) => return
    if node and !idx => idx = obj.nodes.indexOf(node)
    return obj.nodes.splice idx, 1

  render: (names, ...args) ->

    @fire \beforeRender
    _ = (n) ~>
      if typeof(n) == \object =>
        [n,key] = [n.name, n.key]
        if !Array.isArray(key) => key = [key]
      if @map.nodes[n] => @map.nodes[n].map (d,i) ~>
        d <<< {name: n, idx: i}
        @_render n, d, i, (if typeof(@handler[n]) == \object => {view: @handler[n]} else null), false
      if @map.eaches[n] and @handler[n] => @map.eaches[n].map ~> @proc-each n, it, key

    if names => ((if Array.isArray(names) => names else [names]) ++ args).map -> _ it
    else for k in @names => _(k)
    @fire \afterRender

  set-context: (v) ->
    console.warn '[ldview] `setContext` is deprecated. use `setCtx` instead.'
    @ctx = v
  set-ctx: (v) -> @ctx = v

  on: (n, cb) -> @evt-handler.[][n].push cb
  fire: (n, ...v) -> for cb in (@evt-handler[n] or []) => cb.apply @, v

if module? => module.exports = ldview
if window? => window.ldView = window.ldview = ldview
