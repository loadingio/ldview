## Nested Rendering

with multiple `ld-each`, we may want to update based on a chain of keys into specific item of current view.

For example:

    view.render {name: 'prj', key: [...], render: {name: 'item', key: [...]}


## Nested Views

support nested views directly by `ld`. For example ( concept only, may need redesign ):

    template(ld="calendar-template") ...
    template(ld="todolist-template") ...
    div(ld="root")
      div(ld="calendar")
      div(ld="todolist")


    script:
      manager = new ldview.manager!
      manager.add \todolist, do
        template: '[ld=todolist-template]'
        ...
      manager.add \calendar, do
        template: '[ld=todolist-template]'
        ...
        
      view = new ldview do
        root: '[ld=root]'
        manager: view-manager


This can be further wrapped in `@plotdb/block`:

calendar/index.html:

    div ...
    script(type="@plotdb/block")
      pkg: {name: "calendar"}
      interface: ({node}) -> template: node, ...

todolist/index.html:

    div ...
    script(type="@plotdb/block")
      pkg: {name: "todolist"}
      interface: ({node}) -> template: node, ...

app.html:

    div(ld="root")
      div(ld-view="calendar")
      div(ld-view="todolist")

    script:
      mgr = {}
      mgr.block = new block.manager registry: ({name}) -> "#name/index.html"
      # we still need some mechanism here to identify if views are available for some certain names
      # or alternatively, use `ld-view` to explicitly identify names to use nested views.
      mgr.view = new ldview.manager {block: mgr.block, ...}

      view = new ldview do
        root: '[ld=root]'
        manager: mgr.view
