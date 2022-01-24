(->
  ctx = {time: new Date!toLocaleString!, inited: false}
  data = [1 to 20].map -> do
    title: "title #it"
    description: Math.random!toString(36)substring(2)
  view = new ldview do
    ctx: ctx
    root: '[ld-scope=ldview]'
    init:
      name: ({node,local}) ->
        _ = ->
          setTimeout (->
            local.count = (local.count or 10) - 1
            node.innerText = local.count
            if local.count > 0 => _!
            else local.res!
          ), 500

        new Promise (res, rej) ->
          local.res = res
          _!

    handler: do
      inited: ({node, ctx}) -> node.innerText = "is inited? : #{!!ctx.inited}"
      item: do
        list: ->
          start = Math.floor(Math.random!*data.length)
          end = ( 1 + start + Math.floor((data.length - start) * Math.random!)) <? data.length
          data.slice start, end
        view:
          init: -> debounce Math.round((Math.random! * 1500) + 500) .then ->
          handler:
            '@': ({node, ctx, ctxs}) ->
              node.style
                ..background = <[#ecb #bfc #bcf]>[Math.floor(Math.random! * 3)]
            title: ({node, ctx, ctxs}) -> node.innerText = ctx.title
            description: ({node, ctx, ctxs}) -> node.innerText = ctx.description
            date:({node, ctx, ctxs, views}) -> node.innerText = ctxs.0.time
  view.init!then ->
    ctx.inited = true
    view.render \inited
    console.log \done.
  setInterval (->
    ctx.time = new Date!toLocaleString!
    view.render!
  ), 1000
)!
