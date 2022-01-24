# vscroll

Remove elements that are not near visible regions while maintain the scroll bar height and position.


## Why

Reflow is expensive especially when there are too many elements in webpage. By only inserting elements in visible ranges, we can effectively limit the amount of elements.

This is designed to be an alternative or replacement for `Clusterize.js`. The reason for making an alternative is because `Clusterize.js` uses GPL License and you have to purchase license for commercial use, thus is not suitable as a fundamental dependency of other open source projects.


## Install

    npm install --save @loadingio/vscroll


## Usage

include required js file:

    <script src="path-to-dist/index.js"></script>


initialize by passing the container element:

    vs = new vscroll.fixed({root: mycontainer});
    vs.update!


You can update child elements just as if it is a regular DOM element. Just remember to call `update` after:

    vs.insertBefore(newNode, vs.childNodes[0]);
    vs.removeChild(vs.childNodes[vs.childNodes.length - 1]);
    vs.update();


Please note that:

 - we expect the container ( root parameter ) is limited in height and scrollable.
 - we expect nodes to be visible when calling `update`, otherwise we can't correctly calcualte its diemsion.

Also, `update` may still take a long time if there are many children since it scans all children to determine line height and row count. Even a simple `getBoundingClientRect` takes quite long.

Thus, pass an optional `probe-len` option to limit the size of test set of children:

    vs.update(30);

`probe-len` should at least larger than the count of child in a row, but may need a longer length if children's position may be different ( e.g., in a flexbox ) when there are not enough amount of children.


You can always re-calculate the content to be shown by calling `locate()`:

    vs.locate();


## Variations

`vscroll` (plans to) provides different types of virtual scroller, based on how they handle scroll events and manage DOM elements.


### vscroll.fixed

Only attach elements that are near visible region of the container. Expect following conditions:

 - height per row are the same
 - amount of element per row are the same


### vscroll.dummy

A dummy scroll wrapper. No virtualization, reflects DOM operations directly to `root`.


## License

MIT
