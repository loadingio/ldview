
global = do
  user: plan: true
pals = "500px,0099e5 ff4c4c 34bf49,brand\nabout,00a98f 00a98f,brand\nadidas,000 be0027 cf8d2e e4e932 2c9f45 371777 52325d 511378,brand\nadobe,f00 fbb034 fd0 c1d82f 00a4e4 8a7967 6a737b,brand\nadzuna,279b37,brand\naer,008374 008374 89ba16 fefefe,brand\naetna,d20962 f47721 7ac143 00a78e 00bce4 7d3f98,brand\naiesec,037ef3 f85a40 30c39e 0a8ea0 f48924 ffc845 52565e caccd1 f3f4f7,brand\naim,ffd900,brand\nairbnb,fd5c63,brand\nairbus,74d2e7 48a9c5 0085ad 8db9ca 4298b5 005670 00205b 009f4d 84bd00 efdf00 fe5000 e4002b da1884 a51890 0077c8 008eaa,brand\nakamai,09c f93,brand\nalcon,0079c1 49176d 00a0af 49a942,brand\nalgolia,050f2c 003666 00aeff 3369e7 8e43e7 b84592 ff4f81 ff6c5f ffc168 2dde98 1cc7d0,brand\nalibaba,ff6a00,brand\nalienware,0c3866 49c0b6 222 ce181e 007cc0 ffc20e,brand\nalphabet,ed1c24,brand\namazon,f90 146eb4,brand\namerican,002663 002663 4d4f53 ed1b2e ed1b2e 6d6e70 d7d7d8 b4a996 ecb731 8ec06c 537b35 c4dff6 56a0d3 0091cd 004b79 7f181b d7d7d8 9f9fa3 000,brand\namp,1c79c0 0dd3ff 0389ff,brand\nandroid,a4c639,brand\nangies,7fbb00 7fbb00,brand\nangularjs,b52e31 000,brand\nanswers,136ad5 fb8a2e,brand\naol,ff0b00 00c4ff,brand\naparat,ea1d5d,brand\narch,1793d1 1793d1 333,brand\narizona,903 903 ffb310,brand"
  .split \\n
  .map ->
    it = it.split \,
    return {name: it.0, colors: it.1.split(' ').map(->"\##it")}

handler = do
  pal: do
    list: -> pals
    handle: ({node, name}) ->
      colors = ld$.find(node, '.colors', 0)
      ctrl = ld$.find(node, '.ctrl', 0)
      ctrl.parentNode.removeChild ctrl
      colors.innerHTML = node._data.colors
        .map(-> """<div class="color" style="background:#{ldColor.web(it)}"></div>""")
        .join('')
      colors.appendChild ctrl
      
  username: (.node.textContent = global.user.displayname or 'Unnamed')
  userdesc: ->
  useravatar: ->
  "ctrl-panel": ({node, names}) ->
    node.style.display = if ('pro' in names) xor global.user.plan => \none else \block


ldView = (opt = {}) ->
  @handler = opt.handler
  @root = root = if typeof(opt.root) == \string => ld$.find(document, opt.root, 0) else opt.root
  # remove all ld-each by orders.
  @eaches = ld$.find(root, '[ld-each]').map (n) ->
    c = n.parentNode
    i = Array.from(c.childNodes).indexOf(n)
    ret = {container: c, idx: i, node: n, name: n.getAttribute(\ld-each), nodes: []}
    p = document.createComment " ld-each=#{ret.name} "
    p._data = ret
    c.insertBefore p, n
    ret.proxy = p
    c.removeChild n
    return ret
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
  proc-each: (name, data) ~>
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
      data.container.insertBefore node, nodes[lastidx + 1] or data.proxy
      return node
    ns = ret

    ns.map ~> @handler[name].handle {node: it, name: name}


  proc: (names) ->
    _ = (n) ~>
      if @map.nodes[n] => @map.nodes[n].map ~> if @handler[n] => @handler[n](it <<< {name: n})
      if @map.eaches[n] and @handler[n] => @map.eaches[n].map ~> @proc-each n, it
    if names => (if Array.isArray(names) => names else [names]).map -> _ it
    else for k of @handler => _ k


view = new ldView {root: document, handler: handler}
global.user.displayname = 'Kirby Wu'
view.proc!
