(->
  rootview = new ldView init-render: true, root: document, handler: do
    global: ({node}) -> console.log \global, node
    local: ({node}) -> console.log \local, node
  data = [1,2,3,4,5].map -> {key: it, value: it}
  localview = new ldView init-render: true, root: rootview.get(\local), handler: do
    loop: do
      list: -> data
      handle: ({node, data}) ->
        console.log node
        node.innerText = data.value

  data = [5,4,3,2,1].map -> {key: it, value: it}
  localview.render!

)!
