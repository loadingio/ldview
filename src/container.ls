
virtual-container = (opt = {}) ->
  @root = opt.root
  @childNodes = []
  @
virtual-container.prototype = Object.create(Object.prototype) <<<
  appendChild: (n) ->
    @childNodes.splice @childNodes.length, 0, n
    @root.appendChild n
  insertBefore: (n, s) ->
    @childNodes.splice @childNodes.indexOf(s), 0, n
    @root.insertBefore n, s
  removeChild: (n) ->
    if !~(idx = @childNodes.indexOf n) => return
    @childNodes.splice idx, 1
    @root.removeChild n

virtual-container-clustered = (opt = {}) ->
  @childNodes = []
  @root = opt.root
  @init!
  @
virtual-container-clustered.prototype = Object.create(Object.prototype) <<<
  init: ->
    @ <<< range: [1, 0], row: 1, count: 1
    @ph = [0,1]
      .map -> document.createElement \div
      .map ~>
        it.style <<< width: \100%, height: \0px
        @root.appendChild it
    @root.addEventListener \scroll, ~> @handler!
    @rbox = {height: 0}

  update: ->
    @rbox = @root.getBoundingClientRect!
    @ <<< row: 0, count: 1
    for i from 0 til (@childNodes.length <? 100) =>
      if !@childNodes[i].parentNode => @root.insertBefore @childNodes[i], @ph.1
    y = undefined
    for i from 0 til @childNodes.length =>
      box = @childNodes[i].getBoundingClientRect!
      @line-height = box.height
      if !(y?) => y = box.y
      else if box.y == y => @count++
      else
        @line-height = box.y - y
        break
    for i from 0 til @childNodes.length =>
      box = @childNodes[i].getBoundingClientRect!
      if box.y <= @rbox.height * 4 => continue
      @row = (Math.ceil(i / @count) >? 1)
      break
    @delta = (@row * @count) >? 1
    @childNodes.map -> if it.parentNode => it.parentNode.removeChild it
    @handler!

  handler: ->
    [len, delta, count, nodes, lh, root, ph, rbox, range] = [
      @childNodes.length, @delta, @count, @childNodes, @line-height, @root, @ph, @rbox, @range
    ]
    [min,max] = [len,-1]
    for i from 0 til len by delta =>
      j = (i + delta - 1) <? (nodes.length - 1)
      b1 = {y: (i/count) * lh, height: lh}
      b2 = {y: (j/count) * lh, height: lh}
      if b1.y - root.scrollTop <= 1.5 * rbox.height and b2.y + b2.height - root.scrollTop > -0.5 * rbox.height =>
        if i < min => min = i
        if j > max => max = j
    if root.scrollTop > root.scrollHeight / 2 and min == len and max == -1 =>
      [min, max] = [delta * Math.floor(len / delta), len - 1]
    for i from range.0 til min => if nodes[i].parentNode => root.removeChild nodes[i]
    for i from range.0 - 1 to min by -1 => if !nodes[i].parentNode => root.insertBefore nodes[i], ph.0.nextSibling
    for i from range.1 til max by -1 => if nodes[i].parentNode => root.removeChild nodes[i]
    for i from range.1 + 1 to max => if !nodes[i].parentNode => root.insertBefore nodes[i], ph.1
    @range = [min, max]
    ph.0.style.height = "#{lh * ((min/count) >? 0)}px"
    ph.1.style.height = "#{lh * Math.floor((len - max - 1) / count)}px"

  appendChild: (n) ->
    @childNodes.splice @childNodes.length, 0, n
  insertBefore: (n, s) ->
    idx = @childNodes.indexOf(s)
    if idx < 0 => idx = @childNodes.length
    @childNodes.splice idx, 0, n
  removeChild: (n) ->
    if !~(idx = @childNodes.indexOf n) => return
    @childNodes.splice idx, 1

