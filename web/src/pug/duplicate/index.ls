data = {}
view = new ldview do
  root: document.body
  init-render: false
  handler:
    item:
      list: -> data.list
      key: -> it.key
      view:
        text:
          key: ({ctx}) -> ctx.key
          name: ({ctx}) -> ctx.name
    str:
      list: -> data.str-list
      view: text: "@": ({ctx}) -> ctx

Promise.resolve!
  .then ->
    data.list = [
    * key: 1, name: "A"
    * key: 1, name: "B"
    ]
    data.str-list = <[A A]>
    view.render!
  .then -> debounce 1000
  .then ->
    data.list = [
    * key: 1, name: "A"
    ]
    data.str-list = <[A]>
    view.render!
  .then -> debounce 1000
  .then ->
    data.list = [
    * key: 1, name: "A"
    * key: 1, name: "B"
    * key: 1, name: "C"
    ]
    data.str-list = <[A A A]>
    view.render!
