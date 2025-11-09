data = {}
view = new ldview do
  root: document.body
  init-render: true
  action: click: toggle: ({node}) ->
    step = node.dataset.step
    steps[step]!
  handler:
    item:
      list: -> data.list or []
      key: -> it.key
      view:
        text:
          key: ({ctx}) -> ctx.key
          name: ({ctx}) -> ctx.name
    str:
      list: -> data.str-list
      view: text: "@": ({ctx}) -> ctx

steps =
  "1": ->
    data.list = [
    * key: 1, name: "A"
    * key: 1, name: "B"
    ]
    data.str-list = <[A A]>
    view.render!
  "2": ->
    data.list = [
    * key: 1, name: "A"
    ]
    data.str-list = <[A]>
    view.render!
  "3": ->
    data.list = [
    * key: 1, name: "A"
    * key: 1, name: "B"
    * key: 1, name: "C"
    ]
    data.str-list = <[A A A]>
    view.render!
