list = [
  * name: \kirby, score: 100
  * name: \tommy, score: 99
  * name: \john, score: 98
  * name: \sean, score: 97
]
view = new ldview do
  root: document.body
  ctx: {obj: {name: "root ctx", child: {name: "child ctx", score: "99"}}}
  handler:
    list:
      list: -> list
      view:
        text:
          name: ({ctx}) -> ctx.name
          score: ({ctx}) -> ctx.score
    "local-view":
      ctx: {name: \local, score: "69 ( local )"}
      text:
        name: ({ctx}) -> ctx.name
    "template-view":
      template: ld$.find('[template]',0)
      ctx: {name: \template, score: "55 ( template )"}
      text:
        name: ({ctx}) -> ctx.name
        score: ({ctx}) -> ctx.score
    "view-with-nested-ctx":
      template: ld$.find('[template]',0)
      ctx: ({ctx}) -> ctx.obj.child
      text:
        name: ({ctx}) -> ctx.name
        score: ({ctx}) -> ctx.score
  text:
    name: -> "global"
    score: -> "0 ( global )"

