## partially rendering for nested views

We can use an object as parameter in `render`, such as:

    view.render {user: {book: ["name", "title"]}}

which calls the `name` and `title` handler of `book` view / under `user` view only. For loop type:

    view.render {user: {book: {list: (-> it.key < 10), view: ["name", "title"]}}



## ctx function in nested view won't be run again

ctx function in nested view is run only once when inited. This can be intended but somewhat we may need documentation or re-evaluation of design.


## promise-based initialization

we should enable users to wait until init resolved if it return a promise:

  v = new ldview do
    root: document.body
    init: foo: -> Promise.resolve!
    handler: foo: -> ... # only run after `init.foo` resolves.


## Cascade Script Sheet

 - load multiple configs, e.g.,

    new ldview({
      root: "body"
      defs: [cfg1, cfg2, cfg3, ...]
    });

or, with identifiers:

    new ldview({
      root: "body"
      defs: {cfg1, cfg2, cfg3, ...}
    });

or for hybrid model:

    new ldview({
      root: "body"
      defs: [cfg1, cfg2, cfg3, ...]
      scopes: {cfg4, cfg5, ...}
    });


## Dependencies

 - remove `@loadingio/ldquery` dependency.


## Nested Rendering

with multiple `ld-each`, we may want to update based on a chain of keys into specific item of current view.

For example:

    view.render {name: 'prj', key: [...], render: {name: 'item', key: [...]}


## Nested Views

nested local views are supported, but we should still think about supporting module system such as `@plotdb/block` directly. For example:

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
