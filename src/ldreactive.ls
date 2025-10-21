# ldreactive - Reactive data binding library
# Provides dependency tracking and automatic update triggering
# Can be used standalone or integrated with ldview

ldreactive = (data, options = {}) ->
  if !(@ instanceof ldreactive) => return new ldreactive data, options

  # internal state storage
  @_ = {}
  @_.exclude = options.exclude or []
  @_.computed = options.computed or {}
  @_.deps = {}              # 'user.profile.name' -> Set of handler names
  @_.tracking = null        # current tracking handler name
  @_.tracking-path = []     # current tracking path stack
  @_.current-deps = null    # current collecting dependencies (Set)
  @_.proxy = null           # cached root proxy
  @_.proxy-cache = new WeakMap!  # obj -> proxy mapping
  @_.watchers = {}          # key -> [callbacks]
  @_.batch-mode = false     # batch update flag
  @_.pending-changes = []   # pending changes in batch mode
  @_.data = null            # raw data

  # event handler storage
  @evt-handler = {}

  # set initial data if provided
  if data? => @set data

  @

# Factory pattern for convenient creation
ldreactive.create = (data, options) -> new ldreactive data, options

# Prototype methods
ldreactive.prototype = Object.create(Object.prototype) <<< do
  # Event handling - register event listeners
  # supports single event name or array of event names
  on: (n, cb) ->
    (if Array.isArray(n) => n else [n]).map (n) ~> @evt-handler.[][n].push cb
    @

  # Fire event with arguments
  fire: (n, ...v) ->
    for cb in (@evt-handler[n] or []) => cb.apply @, v

  # Set or update data
  # This will clear proxy cache and rebuild reactive proxies
  set: (data) ->
    @_.data = data
    @_.proxy = null  # clear cached proxy
    @_.proxy-cache = new WeakMap!  # rebuild cache
    @fire 'set', data
    @

  # Get reactive proxy of data
  # Returns a Proxy object that tracks property access and modifications
  get: ->
    if !@_.proxy and @_.data => @_.proxy = @_create-proxy @_.data, []
    @_.proxy

  # Get raw data without tracking
  raw: -> @_.data

  # Track dependencies for a handler function
  # @param name - handler identifier
  # @param fn - function to track
  # @return array of dependency paths
  track: (name, fn) ->
    prev-tracking = @_.tracking
    prev-deps = @_.current-deps
    @_.tracking = name
    @_.current-deps = new Set!

    try
      result = fn!
    finally
      deps = Array.from @_.current-deps
      @_.tracking = prev-tracking
      @_.current-deps = prev-deps

    # store dependency relationships: path -> Set of handler names
    for dep in deps
      if !@_.deps[dep] => @_.deps[dep] = new Set!
      @_.deps[dep].add name

    @fire 'track', name, deps
    deps

  # Stop tracking a handler
  # Removes all dependency relationships for the given handler
  untrack: (name) ->
    for key, handlers of @_.deps
      handlers.delete name
    @

  # Watch a specific property for changes
  # @param key - property path (e.g., 'user.name')
  # @param callback - called when property changes
  watch: (key, callback) ->
    if !@_.watchers[key] => @_.watchers[key] = []
    @_.watchers[key].push callback
    @

  # Batch multiple updates into a single change event
  # Useful for performance when making multiple changes
  batch: (fn) ->
    prev = @_.batch-mode
    @_.batch-mode = true
    try
      fn!
    finally
      @_.batch-mode = prev
      @_flush-changes!
    @

  # === Internal Methods ===

  # Create reactive proxy for object with deep tracking
  # @param obj - object to proxy
  # @param path - current path array for nested objects
  # @return Proxy object
  _create-proxy: (obj, path) ->
    # only proxy objects
    return obj if typeof(obj) != \object or !obj

    # check if root property is in exclude list
    if path.length and path[0] in @_.exclude => return obj

    # return cached proxy if exists
    if @_.proxy-cache.has obj => return @_.proxy-cache.get obj

    # handle arrays separately
    if Array.isArray(obj)
      proxy = @_create-array-proxy obj, path
      @_.proxy-cache.set obj, proxy
      return proxy

    # create proxy for object
    self = @
    proxy = new Proxy obj,
      get: (target, key) ->
        # skip internal properties
        if typeof(key) == \symbol or key.toString!startsWith('_') or key == \constructor
          return Reflect.get target, key

        # build full path for dependency tracking
        full-path = if path.length then "#{path.join '.'}.#{key}" else key.toString!

        # record dependency if we're currently tracking
        if self._.tracking and self._.current-deps
          self._.current-deps.add full-path

        value = Reflect.get target, key

        # recursively proxy nested objects/arrays
        if typeof(value) == \object and value != null
          self._create-proxy value, path ++ [key]
        else
          value

      set: (target, key, value) ->
        old-value = target[key]
        result = Reflect.set target, key, value

        # trigger update if value actually changed
        if old-value != value
          full-path = if path.length then "#{path.join '.'}.#{key}" else key.toString!
          self._trigger full-path, value, old-value

        result

    @_.proxy-cache.set obj, proxy
    proxy

  # Create reactive proxy for arrays
  # Intercepts array methods like push, pop, splice, etc.
  # @param arr - array to proxy
  # @param path - current path array
  # @return Proxy object
  _create-array-proxy: (arr, path) ->
    self = @
    proxy = new Proxy arr,
      get: (target, key) ->
        # intercept array mutating methods
        if key in <[push pop shift unshift splice sort reverse]>
          return (...args) ->
            result = target[key].apply target, args
            # trigger update for the entire array
            full-path = if path.length then path.join '.' else 'root'
            self._trigger full-path, target, target
            result

        # track array index access
        if !isNaN(parseInt key)
          full-path = if path.length then "#{path.join '.'}.#{key}" else key.toString!
          if self._.tracking and self._.current-deps
            self._.current-deps.add full-path

        value = Reflect.get target, key

        # recursively proxy nested objects
        if typeof(value) == \object and value != null
          self._create-proxy value, path ++ [key]
        else
          value

      set: (target, key, value) ->
        old-value = target[key]
        result = Reflect.set target, key, value

        if old-value != value
          full-path = if path.length then "#{path.join '.'}.#{key}" else key.toString!
          self._trigger full-path, value, old-value

        result

    @_.proxy-cache.set arr, proxy
    proxy

  # Trigger update for a property change
  # Fires watchers and change events
  # @param key - property path that changed
  # @param value - new value
  # @param old-value - previous value
  _trigger: (key, value, old-value) ->
    # find handlers that depend on this key
    dependents = Array.from(@_.deps[key] or [])

    # trigger watchers for this specific key
    for cb in (@_.watchers[key] or [])
      cb.call @, value, old-value

    # batch mode: collect changes
    if @_.batch-mode
      @_.pending-changes.push {key, value, old-value, dependents}
    else
      @fire 'change', key, value, old-value, dependents

    @

  # Flush pending changes in batch mode
  # Merges all changes and fires a single batch-change event
  _flush-changes: ->
    if !@_.pending-changes.length => return

    # collect all affected handlers
    all-dependents = new Set!
    for change in @_.pending-changes
      for dep in change.dependents => all-dependents.add dep

    @fire 'batch-change', @_.pending-changes, Array.from(all-dependents)
    @_.pending-changes = []
    @

# Export for CommonJS
if module? => module.exports = ldreactive

# Export for browser
if window? => window.ldreactive = ldreactive
