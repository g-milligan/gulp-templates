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
//get the shader program for this context
function getCachedShaderProgram(ctx,shaderProgram){
  //if no shader program explicitely passed
  if(shaderProgram==undefined){
    //if there is a cached shader program
    if(ctx.hasOwnProperty('cachedShaderProgram')){
      //use the cached shader program by default
      shaderProgram=ctx.cachedShaderProgram;
    }
  }
  return shaderProgram;
}
//add a shader to an existing program object... this is done in 3 main logical steps labelled below
function addShaderToProgram(ctx,shaderName,shaderType,shaderProgram){
  var shaderObj;
  //if context is given and it has the createProgram function
  if(ctx!=undefined&&ctx.createProgram){
    //get the current shader program depending on if shaderProgram==undefined
    shaderProgram=getCachedShaderProgram(ctx, shaderProgram);
    //if a shader program is available
    if(shaderProgram!=undefined){

      //==1) GET THE RAW SHADER CODE STRING==

      var shaderStr='';
      switch(shaderType){
        case 'vertex':
          //get the shader code string
          shaderStr=vshader(shaderName);
          //if the shader string is not blank
          if(shaderStr.length>0){
            //init the shader object
            shaderObj=ctx.createShader(ctx.VERTEX_SHADER);
          }
          break;
        case 'fragment':
          //get the shader code string
          shaderStr=fshader(shaderName);
          //if the shader string is not blank
          if(shaderStr.length>0){
            //init the shader object
            shaderObj=ctx.createShader(ctx.FRAGMENT_SHADER);
          }
          break;
      }
      //if the shader program, by name, did exist
      if(shaderObj!=undefined){

        //==2) COMPILE THE SHADER STRING CODE INTO A SHADER OBJECT==

        //pass the shader code to the shader object to compile
        ctx.shaderSource(shaderObj,shaderStr);
        //now, compile the shader object
        ctx.compileShader(shaderObj);
        //if the shader compiled successfully
        if(ctx.getShaderParameter(shaderObj,ctx.COMPILE_STATUS)){

          //==3) ATTACH THE COMPILED SHADER OBJECT TO THE SHADER PROGRAM==

          //bind the shader program to both the shader string and the context object
          ctx.attachShader(shaderProgram,shaderObj);
        }else{
          //uh oh... the shaderObj did not compile successfully
          console.log('An error occurred compiling the shaders: '+ctx.getShaderInfoLog(shaderObj));
          shaderObj=undefined;
        }
      }
    }else{
      console.log('You must initialize a new shader "program" before trying to add any shaders.');
    }
  }
  //return the added shader object
  return shaderObj;
}
//create a new shader program and cache it as a property of the context object
function new_program(ctx){
  var shaderProgram;
  //if context is given and it has the createProgram function
  if(ctx!=undefined&&ctx.createProgram){
    //init a new shader program
    shaderProgram=ctx.createProgram();
    //store the program as a cached property of the context object
    ctx['cachedShaderProgram']=shaderProgram;
  }
  return shaderProgram;
}
//bind all added shaders to a program object
function bind_program(ctx,program){
  //if ctx is a real object for this job
  if(ctx!=undefined&&ctx.linkProgram){
    //get the current shader program depending on if shaderProgram==undefined
    program=getCachedShaderProgram(ctx,program);
    //if there is a shader program
    if(program!=undefined){
      //finish bind
      ctx.linkProgram(program);
      //remove the shader program from the cached property
      ctx['cachedShaderProgram']=undefined;
      //if the program failed somehow
      if (!ctx.getProgramParameter(program,ctx.LINK_STATUS)){
        //uh oh... something went wrong with the shader program
        console.log('Unable to initialize the shader program.');
      }
    }
  }
  return program;
}
//function used to grab vertext shader program strings from function bodies
function vshader(name){
  return getFuncStr('vertex_shader_'+name);
}
//function used to grab fragment shader program strings from function bodies
function fshader(name){
  return getFuncStr('fragment_shader_'+name);
}
//function to add a vertex shader to a program object
function add_vshader(ctx,name,program){
  return addShaderToProgram(ctx,name,'vertex',program);
}
//function to add a fragment shader to a program object
function add_fshader(ctx,name,program){
  return addShaderToProgram(ctx,name,'fragment',program);
}
