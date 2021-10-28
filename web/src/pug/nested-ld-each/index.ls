<-(->it.apply {}) _
ctx = {time: new Date!toLocaleString!}
data = [10 to 15].map -> do
  title: "title #it"
  description: Math.random!toString(36)substring(2)
  list: [2 to 3].map -> Math.ceil( 10 *  Math.random! )
view = new ldView do
  ctx: ctx
  root: '[ld-scope=ldview]'
  handler: do
    item: do
      list: -> data
      view:
        handler:
          title: ({node, ctx, ctxs}) -> node.innerText = ctx.title
          description: ({node, ctx, ctxs}) -> node.innerText = ctx.description
          tag:
            list: ({ctx}) -> ctx.list
            text: ({data}) -> data
