(->
  rootview = new ldView init-render: true, root: document, handler: do
    global: ({node}) -> console.log \global, node
    local: ({node}) -> console.log \local, node
  localview = new ldView init-render: true, root: rootview.get(\local), handler: do
    loop: do
      list: -> [1,2,3,4,5]
      handle: ({node}) -> console.log node

)!
