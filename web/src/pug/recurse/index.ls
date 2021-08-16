view = new ldview do
  root: document.body
  handler: template: (->), root: (->)
template = view.get('template')
template.removeAttribute \ld-scope
template.parentNode.removeChild template
root = view.get('root')

data = {name: 1, child: [
  {name: "1.1"}
  {name: "1.2", child: [
    {name: "2.1", child: [
      {name: "3.1"}
      {name: "3.2"}
      {name: "3.3"}
    ]}
    {name: "2.2"}
    {name: "2.3"}
  ]}
  {name: "1.3"}
]}


rview = new ldview (cfg = {}) <<< do
  ctx: data, root: root
  template: template
  text: name: ({ctx}) -> ctx.name
  handler: item:
    list: ({ctx}) -> ctx.child or []
    view: cfg
