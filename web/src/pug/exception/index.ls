items = [1 to 10].map -> {idx: it, value: Math.random!}
view = new ldview do
  root: document.body
  handler:
    error: ->
    item:
      list: -> items
      key: -> it.idx
      view:
        handler: "@": ({ctx}) ->
          console.log ctx.value
          node.innerText = ctx.value
