/* ==========================
BASIC STARTUP CODE FOR WEB-GL
============================= */

/* Note, all of the canvas elements are stored in an array called 'glCanvasList'.
You can access this array from the document.body object. For example:

  document.body['glCanvasList']
  ...or...
  document.body.glCanvasList

  document.body.glCanvasList[index][property-key]

This is a global array used to access canvas elements and related data in different
places throughout the code. This is NOT standard for webgl, but it's just used here
to help provide access to one or more canvas elements' properties.

The custom 'glCanvasList' property was created and appended to the body object when the document ready event was triggered

*/

//function to initialize the 3d context of a canvas element
function initWebGlContext(canvas){
  var ctx;
  //if canvas element passed
  if(canvas!=undefined){
    //if canvas has the getContext function
    if(canvas.getContext){
      //try to get the context
      ctx=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');
    }
  }
  return ctx;
}

//function to initialize the 3d contexts of multiple canvas element
function initWebGlContexts(){
  //for each canvas elements, one or more...
  for(var c=0;c<document.body['glCanvasList'].length;c++){
    //get one, if not the only, canvas element
    var canvas=document.body['glCanvasList'][c].canvas;
    //initialize the context of this canvas element
    var ctx=initWebGlContext(canvas);
    //add the context as a property of glCanvasList[c]
    document.body['glCanvasList'][c]['context']=ctx;
  }
}

//what happens when the canvas element resizes
function onCanvasResize(){
  //if the canvas list exists yet
  if(document.body.hasOwnProperty('glCanvasList')){
    //for each canvas elements, one or more...
    for(var c=0;c<document.body['glCanvasList'].length;c++){
      //get one, if not the only, canvas element
      var canvas=document.body['glCanvasList'][c].canvas;
      var ctx=document.body['glCanvasList'][c].context;
      //if context is available
      if(ctx){
        //resize the viewport size to match the new size of the canvas
        ctx.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
      }
    }
  }
}
