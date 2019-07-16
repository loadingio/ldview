# ldView

A simple, logic-less client side template engine.


## Usage

ldView works by defining what elements are and how should they be proceeded. Instead of defining how html should be rendered inside DOM, we name elements and assign processors in JavaScript according to their names.

For example, following code names three DIVs with "ld" attributes in "plan free", "plan month", and "plan year" respectively:

    body
      div(ld="plan free")
      div(ld="plan month")
      div(ld="plan year")


To bind the corresponding processor, create a new ldView object with a handler object:

    view = new ldView do
      root: document.body
      handler: do
        # this example actually demonstrates how to do a if/else or switch/case statement.
        plan: ({node, names, name, container, idx, nodes}) ->
          node.style.display = (if currentPlan in names => 'block' else 'none')

Then, render it:

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
        # here we have an object containing a list function and a handle function
        book: do 
          # tell ldView to map book elements to myBookList
          list: -> myBookList

          # node is one of the nodes cloned from the original book element
          # and the data is entry bound to node from myBookList.
          handle: ({node,data,name}) -> 


While you can manually update DOM content in the handler, you can also recursively apply ldView to make the whole process simpler:

    new ldView do
      handler: do
        # instead of a simple handler function,
        # here we have an object containing a list function and a handle function
        book: do 
          list: -> myBookList # tell ldView to map book elements to myBookList
          handle: ({node,data}) ->
            (new ldView do
               root: node,
               handler: do
                 name: (.node.textContent = data.name)
                 author: (.node.textContent = data.author)
            ).render!


After initialization, You probably will want to update some elements instead of updating every node. Just pass target names into render function:

    view = new ldView( ... );
    view.render!
    # after some updates ... only update ld="name" elements.
    view.render <[name]> 


## API

 * new ldView({root, handler})
   handler: hash with node-names as key and function as value.
   - function: ({node}) which node is the element matched with this node-name.
 * view.getAll("node-name") - return a list of nodes in the name of node-name.
 * view.get("node-name") - return the first node with the name of node-name. shorthand for getAll(...)[0]
 * view.render(cfg)


## Placeholder for loading

TBD


## License

MIT
