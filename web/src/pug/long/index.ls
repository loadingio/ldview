<-(->it.apply {}) _
ctx = {time: new Date!toLocaleString!}
data = [1 to 2000].map -> do
  title: "title #it"
  description: Math.random!toString(36)substring(2)

view = new ldview do
  ctx: ctx
  root: '[ld-scope=ldview]'
  handler: do
    item: do
      list: ->
        #start = Math.floor(Math.random!*data.length)
        #end = ( 1 + start + Math.floor((data.length - start) * Math.random!)) <? data.length
        #data.slice start, end
        data
      view:
        handler:
          '@': ({node, ctx, ctxs}) ->
            node.style
              ..background = <[#ecb #bfc #bcf]>[Math.floor(Math.random! * 3)]
          title: ({node, ctx, ctxs}) -> node.innerText = ctx.title
          description: ({node, ctx, ctxs}) -> node.innerText = ctx.description
          date:({node, ctx, ctxs, views}) -> node.innerText = ctxs.0.time
