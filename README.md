# ldView

A simple, logic-less client side template engine.


## Usage

ldView works by defining what elements are and how should they be processed. Instead of defining how html should be rendered inside DOM, we name elements and assign processors in JavaScript according to their names.

For example, following code names three DIVs with "ld" attributes in "plan free", "plan month", and "plan year":

    body
      div(ld="plan free")
      div(ld="plan month")
      div(ld="plan year")


To bind the corresponding processor, create a new ldView object with a handler object:

    view = new ldView do
      root: document.body
      handler: do
        # this example actually demonstrates how to do a if/else or switch/case statement.
        plan: ({node, names, name, container, idx, nodes, context, local}) ->
          node.style.display = (if currentPlan in names => 'block' else 'none')

view by default will be rendered after initialized, but you can render it again with `render` api:

    view.render!


ldView supports basic looping too. Declare an element to be looped with "ld-each" attribute:

    .shelf
      div(ld-each="book")
        .name(ld="name") Sample Name
        .author(ld="author") Sample Author

the element with "book" ld-each attribute will be replaced by a comment node. Then, you can bind it with an array of elements to automatically generate a list of similar book elements with a slightly different handler config:

    new ldView do
      handler: do
        # instead of a simple handler function,
        # here we have an object containing a list function and a handler function
        book: do
          # tell ldView to map book elements to myBookList
          list: -> myBookList

          # optional key getter for stable update
          # key: -> it.key

          # node is one of the nodes cloned from the original book element
          # and the data is entry bound to node from myBookList.
          handler: ({node,data,name}) ->

in list config, you can use all configs available for a generic items. for example,

    book: do
      list: -> ...
      init: ({node, data, name, idx}) ->
      handler: ({node, data, name, idx}) -> ...
      text: -> ...
      action: click: ({node, name, evt, idx}) -> ...



While you can manually update DOM content in the handler, you can also recursively apply ldView to make the whole process simpler:

    new ldView do
      handler: do
        # instead of a simple handler function,
        # here we have an object containing a list function and a handle function
        book: do
          list: -> myBookList # tell ldView to map book elements to myBookList
          init: ({node,data}) ->
            (new ldView do
               root: node,
               handler: do
                 name: (.node.textContent = data.name)
                 author: (.node.textContent = data.author)
            ).render!

Or, let ldView do it for you with `view` option:

    new ldView do
      handler: do
        # instead of a simple handler function,
        # here we have an object containing a list function and a handle function
        book: do
          list: -> myBookList # tell ldView to map book elements to myBookList
          view:
            handler: do
              name: (.node.textContent = data.name)
              author: (.node.textContent = data.author)


After initialization, You probably will want to update some elements instead of updating every node. Just pass target names into render function:

    view = new ldView( ... );
    view.render!
    # after some updates ... only update ld="name" elements.
    view.render <[name]>

For updating partial entries in `ld-each`, use following syntax with keys:

    view.render {name: 'some-ld-each-name', key: [key1, key2, ... ]}


## Scoping

Scope the DOM fragment with `scope` pug mixin and `scope` function:

    +scope("scope-name")
      div(ld="node-name") my element.

Above code fragment will output something like this:

    <div ld-scope="scope-name">
      <div ld="node-name"> my element </div>
    </div>

`ld-scope` will prevent other views to find elements into this scope.

If you want to mix views, you can set the scope to `naked` by adding a `naked-scope` class:

    +scope("scope-name").naked-scope
      div(ld="node-name") my element

This will output following:

    <div ld="node-name"> my element </div>

While this seems to equal to doing nothing, you can prefix `ld` attribute by `scope-name` with `prefix` function in order to distinguish elements for different views:

    +scope("scope-name").naked-scope
      div(ld=prefix("node-name")) my element
      div(ld="global-name") global element

becomes

    <div ld="scope-name$node-name"> my element </div>
    <div ld="global-name"> global element </div>

To access prefix-ed node, adding `prefix` option when initializing ldView:

    var localView = new ldView({prefix: 'scope-name', handler: {
      "node-name": function(node) { ... }
    });
    var localNode = localView.get("node-name");

    var globalView = new ldView({handler: {
      "node-name": function(node) { ... }
    });
    var globalNode = globalView.get("global-name");


Basically `Scope` and `Prefix` are mutual exclusive; with `scope` you don't have to prefix since only you can access `ld` elements within this scope.


## Configurations

 * root - view root
 * handler - object containing name / handler pairs.
   - name will be used when querying DOM in `ld` attribute.
   - handler accept an object as argument:
   - node: the target node
 * action - action handler. object containing event names such as click, mousemove, etc.
   - each member contains a handler object similar to the root handler.
   - example:

    action: {
      click: {
        buy: ({node, evt}) -> ...
      }
      change: {
        name: ({node, evt}) -> ...
        title: ({node, evt}) -> ...
      }

 * prefix - prefix name for this view. view will be global if scope name is not defined.
   this should be used along with the scope pug mixin.
 * init-render - if set to true, ldView automatically calls render immediately after initialized. default true
 * global - set true to use `pd` and `pd-each` for access nodes globally beyond ld-scope. default false.
 * context - default data accessible with in handler functions. can be set later with `setContext` api.

## API

 * new ldView({root, handler})
   handler: hash with node-names as key and function as value.
   - function: ({node}) which node is the element matched with this node-name.
 * view.getAll("node-name") - return a list of nodes in the name of node-name.
 * view.get("node-name") - return the first node with the name of node-name. shorthand for getAll(...)[0]
 * view.render(cfg)
 * view.setContext(v) - set a custom context object for using in handler functions.
 * view.bindEachNode({container, name, node, idx})
   - ldView keeps track of nodes once they are created as in ld-each.
     If for some reason we need a node to be removed from ld-each list but use in other place ( e.g.,
     when dragging outside we need the dragged node to exist for better user experience ), we can
     unbind it and rebind it later.
   - while node is removed from / inserted into ld-each node list, these functions wont update data.
     User should update data themselves otherwise inserted node will be deleted / removed node will
     be re-created in the next render call.
   - parameters:
     - container: container of these ld-each nodes.
     - idx: index to insert this node.
     - node: node to be inserted.
     - name: name of ld-each.
 * view.unbindEachNode({container, name, node, idx})
   - counterpart of bindEachNode.
   - parameters:
     - container: container of these ld-each nodes.
     - idx: if provided, remove node in this position and return it.
     - node: if idx is not provided, user can use the node itself to hint ldView.
     - name: name of ld-each.

## Handler Parameters

When handlers for each ld node is called, it contains following parameters:

 * node - current node
 * names - all name in ld/pd for current node, space separated.
 * name - matched name for current handler of this node.
 * idx - index of current node, if this rule matches multiple times.
 * local - local data for storing information along with the node, in its life cycle.
 * context - view-wise data, set via `setContext` API. default null.
 * data - only for `ld-each` node. bound data for this node.
 * evt - event object if this handler is an event handler.
 * evts - hash for listing all bound events.



## Update Note

 * add `local` parameter for storing data along with node.
 * add `context` parameters for storing data along with ldView.
 * add `global` option for global ldView.
 * `handle` in repeat item is deprecated now. use `handler` instead.


## TODO

 * lookup view from node.


## License

MIT

