(->
  set-evt-handler = (d,k,f) -> d.node.addEventListener k, (evt) -> f({evt} <<< d)

  ldView = (opt = {}) ->
    @handler = opt.handler or {}
    @action = opt.action or {}
    @prefix = opt.prefix
    @init-render = if opt.init-render? => opt.init-render else true
    @root = root = if typeof(opt.root) == \string => ld$.find(document, opt.root, 0) else opt.root
    if !@root => console.warn "[ldView] warning: no node found for root ", opt.root
    # some roots such as document don't support setAttribute. yet document doesn't need scope, too.
    if @root.setAttribute =>
      @id = "ld-#{Math.random!toString(36)substring(2)}"
      # ld-scope-${id} is used to identify a ldView object, for code of excluding scoped object
      @root.setAttribute "ld-scope-#{@id}", ''

    # now we are going to find *[ld]. yet, we want to exclude all that are scoped.
    # this can be done by ":scope :not([ld-scope]) [ld], :scope > [ld]"
    # but IE/Edge don't support :scope ( https://caniuse.com/#search=%3Ascope )
    # so we manually exclude them.
    # following is for [ld-each]; we will take care of [ld] later.
    selector = if @prefix => "[ld-each^=#{@prefix}\\$]" else "[ld-each]"
    # querySelector returns all nodes that matches the seletor, even if some rule are above / in parent of root.
    # so, we use a ld-root to trap the rule inside.
    exclusions = ld$.find(root, (if @id => "[ld-scope-#{@id}] " else "") + "[ld-scope] #selector")
    all = ld$.find(root, selector)
    # remove all ld-each by orders.
    @eaches = all.filter -> !(it in exclusions)
      .map (n) ->
        p = n.parentNode
        while p => if p == document => break else p = p.parentNode
        if !p => return null
        if ld$.parent(n.parentNode, '*[ld-each]', document) => return null
        c = n.parentNode
        i = Array.from(c.childNodes).indexOf(n)
        ret = {container: c, idx: i, node: n, name: n.getAttribute(\ld-each), nodes: []}
        p = document.createComment " ld-each=#{ret.name} "
        p._data = ret
        c.insertBefore p, n
        ret.proxy = p
        c.removeChild n
        return ret
      .filter -> it

    # now here is for [ld]
    selector = if @prefix => "[ld^=#{@prefix}\\$]" else "[ld]"
    exclusions = ld$.find(root, (if @id => "[ld-scope-#{@id}] " else "") + "[ld-scope] #selector")
    all = ld$.find(root, selector)
    @nodes = all.filter -> !(it in exclusions)

    prefixRE = if @prefix => new RegExp("^#{@prefix}\\$") else null
    @map = nodes: {}, eaches: {}
    @nodes.map (node) ~>
      names = (node.getAttribute(\ld) or "").split(' ')
      if @prefix => names = names.map -> it.replace(prefixRE,"").trim!
      names.map ~> @map.nodes[][it].push {node, names, evts: {}}
    @eaches.map (node) ~> @map.eaches[][node.name].push node
    names = {}
    for list in ([[k for k of @handler]] ++ [v for k,v of @action].map (it) -> [k for k of it]) =>
      for it in list => names[it] = true
    @names = [k for k of names]
    if @init-render => @render!
    @

  ldView.prototype = Object.create(Object.prototype) <<< do
    #data = {container, idx, node, name, nodes, proxy}
    # node._data = item in list
    proc-each: (name, data) ->
      list = @handler[name].list! or []

      items = []
      nodes = data.nodes
        .filter(->it)
        .map (n) -> 
          if !(n._data in list) =>
            if n.parentNode => n.parentNode.removeChild n
            n._data = null
          else items.push n._data
          n
        .filter (._data)
      lastidx = 0
      ret = list.map (n,i) ->
        if (lastidx := items.indexOf(n)) >= 0 => return nodes[lastidx]
        node = data.node.cloneNode true
        node._data = n
        node.removeAttribute \ld-each
        data.container.insertBefore node, (nodes[lastidx + 1] or data.proxy)
        return node
      ns = ret
      ns.map ~> @handler[name].handle {node: it, name: name, data: it._data}
      data.nodes = ns

    get: (n) -> ((@map.nodes[n] or []).0 or {}).node
    getAll: (n) -> (@map.nodes[n] or []).map -> it.node

    render: (names) ->
      _ = (n) ~>
        if @map.nodes[n] => @map.nodes[n].map (d,i) ~>
          d <<< {name: n, idx: i}
          if @handler[n] => @handler[n](d)
          for k,v of @action =>
            if v and v[n] and !d.{}evts[k] =>
              # scoping so event handler can call v[n]
              set-evt-handler d, k, v[n]
              d.evts[k] = true
        if @map.eaches[n] and @handler[n] => @map.eaches[n].map ~> @proc-each n, it
      if names => (if Array.isArray(names) => names else [names]).map -> _ it
      else for k in @names => _(k)

  if module? => module.exports = ldView
  if window? => window.ldView = ldView
)!
