# Test 1: Basic Counter - Property Tracking
(->
  console.log "Test 1: Basic Counter"
  
  # Create reactive state
  state = new ldreactive({count: 0})
  renderCount = 0
  
  view = new ldview do
    ctx: state
    root: '[ld-scope=test1]'
    handler:
      count: ({node, ctx}) ->
        renderCount++
        node.textContent = ctx.count
      renderCount: ({node}) ->
        node.textContent = renderCount
      increment: ({node, ctx}) ->
        node.onclick = ->
          ctx.count++
          view.render \renderCount
      decrement: ({node, ctx}) ->
        node.onclick = ->
          ctx.count--
          view.render \renderCount
      reset: ({node, ctx}) ->
        node.onclick = ->
          ctx.count = 0
          view.render \renderCount
  
  console.log "Test 1 initialized"
)!

# Test 2: Nested Object Tracking
(->
  console.log "Test 2: Nested Object Tracking"
  
  # Create reactive state with nested objects
  state = new ldreactive do
    address:
      street: "123 Main St"
      city: "New York"
      country: "USA"
  
  view = new ldview do
    ctx: state
    root: '[ld-scope=test2]'
    handler:
      street: ({node, ctx}) ->
        node.textContent = ctx.address.street
      city: ({node, ctx}) ->
        node.textContent = ctx.address.city
      country: ({node, ctx}) ->
        node.textContent = ctx.address.country
      fullAddress: ({node, ctx}) ->
        # This should track all three nested properties
        node.textContent = "#{ctx.address.street}, #{ctx.address.city}, #{ctx.address.country}"
      changeStreet: ({node, ctx}) ->
        streets = ["456 Oak Ave", "789 Elm St", "321 Pine Rd", "654 Maple Dr"]
        node.onclick = ->
          ctx.address.street = streets[Math.floor(Math.random! * streets.length)]
      changeCity: ({node, ctx}) ->
        cities = ["Los Angeles", "Chicago", "Houston", "Phoenix"]
        node.onclick = ->
          ctx.address.city = cities[Math.floor(Math.random! * cities.length)]
      changeCountry: ({node, ctx}) ->
        countries = ["USA", "Canada", "UK", "Australia"]
        node.onclick = ->
          ctx.address.country = countries[Math.floor(Math.random! * countries.length)]
  
  console.log "Test 2 initialized"
)!

# Test 3: Array/List Tracking
(->
  console.log "Test 3: Array/List Tracking"
  
  # Create reactive state with array
  itemCounter = 0
  state = new ldreactive do
    items: []
  
  view = new ldview do
    ctx: state
    root: '[ld-scope=test3]'
    handler:
      count: ({node, ctx}) ->
        node.textContent = ctx.items.length
      itemsList: ({node, ctx}) ->
        # Show items as JSON string to demonstrate array tracking
        node.textContent = JSON.stringify(ctx.items)
      addItem: ({node, ctx}) ->
        node.onclick = ->
          itemCounter++
          ctx.items.push {id: itemCounter, text: "Item ##{itemCounter}"}
      removeItem: ({node, ctx}) ->
        node.onclick = ->
          if ctx.items.length > 0
            ctx.items.pop!
      clearAll: ({node, ctx}) ->
        node.onclick = ->
          # Test reassignment
          ctx.items = []
  
  console.log "Test 3 initialized"
)!

# Test 4: Batch Updates
(->
  console.log "Test 4: Batch Updates"
  
  # Create reactive state
  state = new ldreactive do
    name: "John"
    age: 25
    email: "john@example.com"
  
  updateCounter = 0
  
  view = new ldview do
    ctx: state
    root: '[ld-scope=test4]'
    handler:
      name: ({node, ctx}) ->
        node.textContent = ctx.name
      age: ({node, ctx}) ->
        node.textContent = ctx.age
      email: ({node, ctx}) ->
        node.textContent = ctx.email
      batchCount: ({node}) ->
        node.textContent = updateCounter
      updateAll: ({node}) ->
        node.onclick = ->
          # Use batch to update all at once
          updateCounter++
          state.batch ->
            data = state.get!
            data.name = "Jane"
            data.age = 30
            data.email = "jane@example.com"
          view.render \batchCount
      updateSeparate: ({node}) ->
        node.onclick = ->
          # Update separately (not batched) - multiple updates
          updateCounter++
          data = state.get!
          data.name = "Bob"
          data.age = 35
          data.email = "bob@example.com"
          view.render \batchCount
  
  console.log "Test 4 initialized"
)!

# Test 5: Manual Render Control (reactive: false)
(->
  console.log "Test 5: Manual Render Control"
  
  # Create reactive state
  state = new ldreactive do
    value: 100
  
  autoRenderCount = 0
  manualRenderCount = 0
  
  view = new ldview do
    ctx: state
    root: '[ld-scope=test5]'
    handler:
      autoValue: ({node, ctx}) ->
        autoRenderCount++
        node.textContent = ctx.value
      manualValue:
        reactive: false  # Disable automatic reactive updates
        handler: ({node, ctx}) ->
          manualRenderCount++
          # With reactive: false, this handler won't be called automatically
          # when ctx.value changes, but we can still read the current value
          node.textContent = ctx.value
      autoCount: ({node}) ->
        node.textContent = autoRenderCount
      manualCount: ({node}) ->
        node.textContent = manualRenderCount
      changeValue: ({node}) ->
        node.onclick = ->
          data = state.get!
          data.value = Math.floor(Math.random! * 1000)
          # Auto handler will update automatically
          # Manual handler won't update
          view.render \autoCount
      manualRender: ({node}) ->
        node.onclick = ->
          # Manually trigger render for the manual handler
          view.render \manualValue
          view.render \manualCount
  
  console.log "Test 5 initialized"
)!

console.log "All reactive integration tests initialized"
