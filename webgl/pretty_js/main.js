/* =======
MAIN LOGIC
========== */

//---console.log('my vertex shader: '+vshader('name1'));
//---console.log('my fragment shader: '+fshader('name1'));

//what happens on page load
function onPageLoad(){
  //for each canvas on the page, initialize the 3d context, so it can be called from
  //document.body['glCanvasList'][index].context
  initWebGlContexts();
  //get the first, if not only, canvas element context
  var ctx=document.body['glCanvasList'][0].context;

  //if the ctx context was successfully initialized
  if(ctx){
    ctx.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
    ctx.enable(ctx.DEPTH_TEST);                               // Enable depth testing
    ctx.depthFunc(ctx.LEQUAL);                                // Near things obscure far things
    ctx.clear(ctx.COLOR_BUFFER_BIT|ctx.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
  }
}
