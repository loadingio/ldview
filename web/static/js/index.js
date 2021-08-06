(function(){
  var ctx, data, view;
  ctx = {
    time: new Date().toLocaleString()
  };
  data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(function(it){
    return {
      title: "title " + it,
      description: Math.random().toString(36).substring(2)
    };
  });
  view = new ldView({
    ctx: ctx,
    root: '[ld-scope=ldview]',
    handler: {
      item: {
        list: function(){
          var start, end, ref$, ref1$;
          start = Math.floor(Math.random() * data.length);
          end = (ref$ = 1 + start + Math.floor((data.length - start) * Math.random())) < (ref1$ = data.length) ? ref$ : ref1$;
          return data.slice(start, end);
        },
        view: {
          handler: {
            '@': function(arg$){
              var node, ctx, ctxs, x$;
              node = arg$.node, ctx = arg$.ctx, ctxs = arg$.ctxs;
              x$ = node.style;
              x$.background = ['#ecb', '#bfc', '#bcf'][Math.floor(Math.random() * 3)];
              return x$;
            },
            title: function(arg$){
              var node, ctx, ctxs;
              node = arg$.node, ctx = arg$.ctx, ctxs = arg$.ctxs;
              return node.innerText = ctx.title;
            },
            description: function(arg$){
              var node, ctx, ctxs;
              node = arg$.node, ctx = arg$.ctx, ctxs = arg$.ctxs;
              return node.innerText = ctx.description;
            },
            date: function(arg$){
              var node, ctx, ctxs, views;
              node = arg$.node, ctx = arg$.ctx, ctxs = arg$.ctxs, views = arg$.views;
              return node.innerText = ctxs[0].time;
            }
          }
        }
      }
    }
  });
  return setInterval(function(){
    ctx.time = new Date().toLocaleString();
    return view.render();
  }, 1000);
})();