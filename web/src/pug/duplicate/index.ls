
view = new ldview do
  root: document.body
  init-render: false
  handler:
    item:
      list: -> list
      key: -> it.key
      view:
        text:
          key: ({ctx}) -> ctx.key
          name: ({ctx}) -> ctx.name

list = [
* key: 1, name: "A"
* key: 1, name: "B"
]

view.render!

list = [
* key: 1, name: "A"
]

view.render!
