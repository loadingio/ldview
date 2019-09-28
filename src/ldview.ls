(->
  ldView = (opt = {}) ->
    @handler = opt.handler
    @ <<< opt{scope, init-render}
    @root = root = if typeof(opt.root) == \string => ld$.find(document, opt.root, 0) else opt.root
    # some roots such as document don't support setAttribute. yet document doesn't need scope, too.
    if @root.setAttribute =>
      # if scoping - use ld-scope to identify it.
      if @scope => @root.setAttribute \ld-scope, @scope
      @root.setAttribute \ld-root, @id = "ld-#{Math.random!toString(36)substring(2)}"
    # remove all ld-each by orders.
    @eaches = ld$.find(root, '[ld-each]')
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

    # now we are going to find *[ld]. yet, we want to exclude all that are scoped.
    # this can be done by ":scope :not([ld-scope]) [ld], :scope > [ld]"
    # but IE/Edge don't support :scope ( https://caniuse.com/#search=%3Ascope )
    # so we manually exclude them.
    selector = if @scope => "[ld^=#{@scope}\\$]" else "[ld]"
    # querySelector returns all nodes that matches the seletor, even if some rule are above / in parent of root.
    # so, we use a ld-root to trap the rule inside.
    exclusions = ld$.find(root, (if @id => "[ld-root=#{@id}] " else "") + "[ld-scope] #selector")
    all = ld$.find(root, selector)
    @nodes = all.filter -> !(it in exclusions)

    prefixRE = if @scope => new RegExp("^#{@scope}\\$") else null
    @map = nodes: {}, eaches: {}
    @nodes.map (node) ~>
      names = (node.getAttribute(\ld) or "").split(' ')
      if @scope => names = names.map -> it.replace(prefixRE,"").trim!
      names.map ~> @map.nodes[][it].push {node, names}
    @eaches.map (node) ~> @map.eaches[][node.name].push node
    if @init-render => @render!
    @

  ldView.prototype = Object.create(Object.prototype) <<< do
    #data = {container, idx, node, name, nodes, proxy}
    # node._data = item in list
    proc-each: (name, data) ->
      list = @handler[name].list!

      items = []
      nodes = data.nodes
        .map (n) -> 
          if !(n._data in list) =>
            n.parentNode.removeChild n
            n._data = null
          else items.push n._data
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

    get: (n) -> ((@map.nodes[n] or []).0 or {}).node
    getAll: (n) -> (@map.nodes[n] or []).map -> it.node

    render: (names) ->
      _ = (n) ~>
        if @map.nodes[n] => @map.nodes[n].map ~> if @handler[n] => @handler[n](it <<< {name: n})
        if @map.eaches[n] and @handler[n] => @map.eaches[n].map ~> @proc-each n, it
      if names => (if Array.isArray(names) => names else [names]).map -> _ it
      else for k of @handler => _ k

  if module? => module.exports = ldView
  if window? => window.ldView = ldView
)!
