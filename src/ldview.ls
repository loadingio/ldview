set-evt-handler = (d,k,f) -> d.node.addEventListener k, (evt) -> f({evt} <<< d)

# Import ldreactive for reactive data binding support
ldreactive = if module? and require? => require('./ldreactive.js') else window?ldreactive

ldview = (opt = {}) ->
  if arguments.length > 1 => opt = ldview.merge.apply ldview, Array.from(arguments)
  @evt-handler = {}

  # configs only for internal usage
  @_ctxs = opt.ctxs or null
  @views = [@] ++ (opt.base-views or [])

  @_ctx = opt.context or opt.ctx or null
  if opt.context => console.warn '[ldview] `context` is deprecated. use `ctx` instead.'

  # Reactive data binding support
  @_reactive = null
  @_reactive-enabled = false
  if @_ctx and ldreactive and (@_ctx instanceof ldreactive or @_ctx._isReactiveContext)
    @_reactive = @_ctx
    @_reactive-enabled = true
    # Listen for changes and auto-render affected handlers
    @_reactive.on 'change', (key, value, old-value, dependents) ~>
      if dependents and dependents.length > 0
        @render dependents

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
  # if _ctx is a function, ctx will  updated each time before render now.
  # we probably may want to add a config to disable this behavior in the future, such as:
  # if opt.ctx-only-init and typeof(@_ctx) == \function =>
  #   @_ctx = @_ctx {node: @root, ctxs: @_ctxs, views: @views}



  @update!

  names = {}
  for list in ([[k for k of @initer]] ++ [[k for k of @attr]] ++ [[k for k of @style]] ++ [[k for k of @text]] ++ [[k for k of @handler]] ++ [v for k,v of @action].map (it) -> [k for k of it]) =>
    for it in list => names[it] = true
  @names = [k for k of names]
  # TODO we don't yet support proxise.once in @init.
  # Thus, to be able to wait until init, we have to set init-render to false.
  if @init-render => @init!then ~> @render!
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
  proc-each: (name, data, key = null, init-only) ->
    c = if typeof(@_ctx) == \function => @_ctx {node: @root, ctxs: @_ctxs, views: @views} else @_ctx
    list = @handler[name].list({
      name: data.name, node: data.node, views: @views
      context: c, ctx: c
      ctxs: @_ctxs
    }) or []
    getkey = @handler[name].key
    keycount = {}
    items = []
    usekey = !!getkey
    if !getkey => getkey = (->it)
    else
      list.map (n) ->
        if typeof(k = getkey n) == \object => return
        keycount[k] = (keycount[k] or 0) + 1
    nodes = data.nodes
      .filter(->it)
      .map (n) ->
        k = getkey(n._data)
        if (typeof(k) != \object and !usekey) # plain text without key - dup is possible
        or (typeof(k) == \object and !(n._data in list)) # obj: match obj directly
        or (usekey and !keycount[k]) => # has getkey with nonobj key, but not exists
          data.container.removeChild n
          delete n._data
        else
          items.push k
          # has getkey with nonobj key, and exist.
          # reduce same key count to balance between data and node
          if usekey and keycount[k] => keycount[k]--
        n
      .filter -> it._data?
    proxy-index = Array.from(data.container.childNodes).indexOf(data.proxy)
    if proxy-index < 0 => proxy-index = data.container.childNodes.length
    ns = []
    # we are going to create nodes based on keys. however, we won't want
    # to create nodes for duplicated keys if `getkey` is provided and key isn't an obj.
    # thus we track if a key is dup by `consumed` hash.
    consumed = {}
    for i from list.length - 1 to 0 by -1 =>
      n = list[i]
      k = getkey(n)
      if usekey and typeof(k) != \object => consumed[k] = (consumed[k] or 0) + 1
      if (j = items.indexOf(k)) >= 0 =>
        node = nodes[j]
        # we consume matched entries in items and nodes
        # so we can still locate duplicated entries in following iterations.
        # without this, we will always find the exact same node for the same key from different objects.
        items.splice j, 1
        nodes.splice j, 1
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
      # this can prevent dup key from creating new node.
      if usekey and (typeof(k) != \object) => if consumed[k] > 1 => continue
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
    ps = _.map (it,i) ~> @_render name, it._obj, i, @handler[name], true, init-only
    if data.container.update => data.container.update!
    data.nodes = ns
    return Promise.all(ps)

  get: (n) -> ((@map.nodes[n] or []).0 or {}).node
  getAll: (n) -> (@map.nodes[n] or []).map -> it.node
  # n: node
  # d: data
  # i: index. not a reliable information, since for `ld` it's order from query. deprecate it and remove?
  # b: base handling class. will be local object for repeat items (or, for recursed handler), otherwise is null
  # e: true if from each
  # init-only: init only
  _render: (n,d,i,b,e, init-only) ->
    # Get context - if reactive, use the proxy
    c = if @_reactive-enabled
      then @_reactive.get!
      else if typeof(@_ctx) == \function
        then @_ctx {node: @root, ctxs: @_ctxs, views: @views}
        else @_ctx
    d <<< {ctx: c, context: c, ctxs: @_ctxs, views: @views}

    # Check if this handler has reactive disabled
    reactive-allowed = @_reactive-enabled
    if b and typeof(b.reactive) != \undefined => reactive-allowed = b.reactive

    if b =>
      if b.view =>
        init = ({node,local,data,ctx,ctxs,views}) ->
          local._view = new ldview({ctx: data} <<< b.view <<< {
            init-render: false, root: node, base-views: views
            ctxs: (if ctxs => [ctx] ++ ctxs else [ctx])
          })
          local._view.init!
        handler = ({local,data,ctx,ctxs}) ->
          if e => local._view.ctx(data)
          local._view.ctxs(if ctxs => [ctx] ++ ctxs else [ctx])
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
      if init and !d.{}inited[n] => d.inited[n] = Promise.resolve(init(d)).then(->d.inited[n] = true)
      if init-only => return Promise.resolve(d.{}inited[n])
      # TODO render after inited ( p resolved )
      # TODO also, we may want to wait handler ( for its sub-init be resolved )

      # Wrap handler execution with dependency tracking if reactive is enabled
      if handler =>
        if reactive-allowed and @_reactive
          @_reactive.track n, -> handler(d)
        else
          handler(d)

      if text =>
        text-val = if typeof(text) == \function
          then (if reactive-allowed and @_reactive
            then @_reactive.track n, -> text(d)
            else text(d))
          else text
        d.node.textContent = text-val

      if attr =>
        attr-val = if reactive-allowed and @_reactive
          then @_reactive.track n, -> attr(d)
          else attr(d)
        for k,v of (attr-val or {}) => d.node.setAttribute(k,v)

      if style =>
        style-val = if reactive-allowed and @_reactive
          then @_reactive.track n, -> style(d)
          else style(d)
        for k,v of (style-val or {}) => d.node.style[k] = v
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

  init: (names, ...args) -> @_prerender \init, names, args
  render: (names, ...args) -> @_prerender \render, names, args
  _prerender: (type, names, args) ->
    init-only = (type == \init)
    @fire \beforeRender
    _ = (n) ~>
      ps = []
      if typeof(n) == \object =>
        [n,key] = [n.name, n.key]
        if !Array.isArray(key) => key = [key]
      if @map.nodes[n] => ps ++= @map.nodes[n].map (d,i) ~>
        d <<< {name: n, idx: i}
        @_render n, d, i, (if typeof(@handler[n]) == \object => {view: @handler[n]} else null), false, init-only
      if @map.eaches[n] and @handler[n] =>
        ps ++= @map.eaches[n].map ~> @proc-each n, it, key, init-only
      Promise.all ps

    ps = if names => ((if Array.isArray(names) => names else [names]) ++ args).map -> _ it
    else for k in @names => _(k)
    @fire \afterRender
    return Promise.all(ps)

  set-context: (v) ->
    console.warn '[ldview] `setContext` is deprecated. use `ctx(...)` instead.'
    @_ctx = v
  # deprecate `setCtx`. use `ctx` now.
  set-ctx: (v) ->
    console.warn '[ldview] `setCtx` is deprecated. use `ctx(...)` instead.'
    @_ctx = v
  ctx: (v) -> if arguments.length => @_ctx = v else @_ctx

  # internal api. prevent using this outside lib
  ctxs: (v) -> if arguments.length => @_ctxs = v else @_ctxs

  on: (n, cb) -> @evt-handler.[][n].push cb
  fire: (n, ...v) -> for cb in (@evt-handler[n] or []) => cb.apply @, v

ldview.merge = -> ldview._merge.apply ldview, ([{}] ++ Array.from(arguments))
ldview._merge = ->
  list = Array.from(arguments)
  if list.length < 2 => return list.0
  a = list.splice 0, 1 .0
  for b in list => for k of b
    if !b[k] => continue
    if typeof(b[k]) == \object and b[k].constructor == Object =>
      ldview._merge (a[k] or (a[k] = {})), b[k]
    else a[k] = b[k]
  return a

# Export ldreactive as static method for reactive data binding
if ldreactive => ldview.reactive = ldreactive

if module? => module.exports = ldview
if window? => window.ldView = window.ldview = ldview
