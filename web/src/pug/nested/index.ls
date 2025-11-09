viewcfg = text: "@": ({ctx}) -> ctx.name
view = new ldview do
  root: document.body
  ctx: -> head: {name: \head}, body: {name: \body}, foot: {name: \foot}, finger: <[1 2 3 4 5]>
  handler:
    head: {ctx: ({ctx}) -> ctx.head} <<< viewcfg
    body: {ctx: ({ctx}) -> ctx.body} <<< viewcfg
    foot: {ctx: ({ctx}) -> ctx.foot} <<< viewcfg
    finger:
      list: ({ctx}) -> ctx.finger
      view: text: idx: ({ctx}) -> ctx
