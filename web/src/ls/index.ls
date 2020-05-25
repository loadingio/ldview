(->
  context = {time: new Date!toLocaleString!}
  data = [1 to 20].map -> do
    title: "title #it"
    description: Math.random!toString(36)substring(2)
  view = new ldView do
    context: context
    root: '[ld-scope=ldview]'
    handler: do
      item: do
        list: ->
          start = Math.floor(Math.random!*data.length)
          end = ( 1 + start + Math.floor((data.length - start) * Math.random!)) <? data.length
          data.slice start, end
        init: ({node, local, data, context}) ->
          local.view = new ldView do
            context: {context, data}
            root: node
            handler: do
              title: ({node, context}) -> node.innerText = context.data.title
              description: ({node, context}) -> node.innerText = context.data.description
              date:({node, context}) -> node.innerText = context.context.time
        handler: ({local, data, context}) ->
          local.view.setContext {context, data}
          local.view.render!
  setInterval (->
    context.time = new Date!toLocaleString!
    view.render!
  ), 1000
)!
