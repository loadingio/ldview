# Change Logs

## v0.0.8

 - release with compact directory structure


## v0.0.7

 - fix `main` field and add `browser` field in `package.json`
 - minimize minimized file further with mangling and compression
 - upgrade modules


## v0.0.6

 - bug fix: probe-len should not be longer than childNodes.length 


## v0.0.5

 - support `setChild` for directly update content via innerHTML
 - support update based on partial content with an additional parameter `probe-len`
 - make `update` faster by removing unnecessary calculation
 - bug fix: use the real parent before removing node
 

## v0.0.4

 - rename `handler` to `locate` to reflect its purpose and make it as an open api


## v0.0.3

 - by default set `grid-column: 1 / -1` in placeholder to support grid layout
 - insert all nodes initially instead of only 100 items to correctly get row and count
   - this can be improved by progressively insertion in the future.
 - calculate row count by relative node position to container instead of to viewport
 - reset values, DOM and scrollTop when call `update` to prevent glitches.
   - we may want to preserve scrollTop in the future update.


## v0.0.2

 - don't calculate box for elements that are not ELEMENT_NODE


## v0.0.1

 - initial release
