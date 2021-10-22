list = [
  * name: \kirby, score: 100
  * name: \tommy, score: 99
  * name: \john, score: 98
  * name: \sean, score: 97
]
view = new ldview do
  root: document.body
  handler:
    list:
      list: -> list
      view:
        text: name: ({ctx}) ->
          console.log ctx
          ctx.name
    "local-view":
      ctx: {name: \local, score: 69}
      text:
        name: ({ctx}) -> ctx.name
    "template-view":
      template: ld$.find('[template]',0)
      ctx: {name: \local, score: 55}
      text:
        name: ({ctx}) -> ctx.name
  text:
    score: -> "global"
    name: -> "global"

