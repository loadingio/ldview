(->
  ldView = (opt = {}) ->
    @handler = opt.handler
    @root = root = if typeof(opt.root) == \string => ld$.find(document, opt.root, 0) else opt.root
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
    # find all ld
    @nodes = ld$.find(root, '[ld]')
    @map = nodes: {}, eaches: {}
    @nodes.map (node) ~>
      names = (node.getAttribute(\ld) or "").split ' '
      names.map ~> @map.nodes[][it].push {node, names}
    @eaches.map (node) ~> @map.eaches[][node.name].push node
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


    render: (names) ->
      _ = (n) ~>
        if @map.nodes[n] => @map.nodes[n].map ~> if @handler[n] => @handler[n](it <<< {name: n})
        if @map.eaches[n] and @handler[n] => @map.eaches[n].map ~> @proc-each n, it
      if names => (if Array.isArray(names) => names else [names]).map -> _ it
      else for k of @handler => _ k

  if module? => module.exports = ldView
  if window? => window.ldView = ldView
)!
