//==ERROR EVENT==

window.onerror=function(msg,url,lineno){
  console.log(url+' ('+lineno+'): '+msg);
};

//==HELPERS TO CREATE STANDARD WEB-GL PROGRAM/SHADER OBJECTS==

var scriptsJson;
function cacheScriptElems(){
  //if the scripts info isn't already cached
  if(scriptsJson==undefined){
    scriptsJson={};
    //function to get script contents
    var getScriptContents=function(elem){
      var content=elem.textContent||elem.innerText;
      content=content.trim();
      //if the content contains cdata
      var contentLower=content.toLowerCase();
      var indexOfCdata=contentLower.indexOf('<![cdata[');
      if(indexOfCdata!==-1){
        //if there is an end cdata character
        var indexOfEndCdata=contentLower.lastIndexOf(']]>');
        if(indexOfEndCdata!==-1){
          //if they are in the correct order
          if(indexOfCdata<indexOfEndCdata){
            //if first newline doesn't exist or is after first cdata
            var indexOfNewline=contentLower.indexOf("\n");
            if(indexOfNewline===-1||indexOfCdata<indexOfNewline){
              //if last newline doesn't exist or is before end cdata
              var lastIndexOfNewline=contentLower.lastIndexOf("\n");
              if(lastIndexOfNewline===-1||indexOfEndCdata>lastIndexOfNewline){
                //strip off the first cdata
                content=content.substring(indexOfCdata+'<![cdata['.length);
                //strip off the last cdata
                content=content.substring(0, content.lastIndexOf(']]>'));
                content=content.trim();
              }
            }
          }
        }
      }
      return content;
    };
    //for each script element
    var scriptElems=document.body.getElementsByTagName('script');
    for(var s=0;s<scriptElems.length;s++){
      var scriptElem=scriptElems[s];
      //if the script element has an id
      var id=scriptElem.id; if(id==undefined){id='';}
      if(id.length>0){
        //if script type contains shader
        var scriptType=scriptElem.type; if(scriptType==undefined){scriptType='';}
        if(scriptType.indexOf('shader')!==-1){
          var type='';
          //if script type contains fragment
          if(scriptType.indexOf('vertex')!==-1){
            type='vertex-shader';
          }else if(scriptType.indexOf('fragment')!==-1){
            type='fragment-shader';
          }
          //if there is a valid shader type for this script
          if(type.length>0){
            //cache the script info
            var contents=getScriptContents(scriptElem);
            scriptsJson[id]={type:type, src:contents, elem:scriptElem};
          }
        }else{
          //not a shader...

        }
      }
    }
  }
}
//pass an id or script element to get the cached info on this shader data
function getScriptInfo(which){
  var ret;
  //cache the script elements if not already available in cache
  cacheScriptElems(); var id='';
  //depending on the typeof which
  switch(typeof which){
    case 'string':
      id=which;
      break;
    default: //which is probably an html element
      if(which.hasOwnProperty('tagName')){
        if(which.tagName.toLowerCase()==='script'){
          id=which.id; if(id==undefined){id='';}
        }
      }
      break;
  }
  if(id.length>0){
    if(scriptsJson.hasOwnProperty(id)){
      ret=scriptsJson[id];
    }
  }
  return ret;
}

function createShader(str,type){
	//init new shader
	var shader=gl.createShader(type);
	//set the shader's source code string
	gl.shaderSource(shader, str);
	//compile the shader's source code
	gl.compileShader(shader);
  //if compile failed
  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
    throw gl.getShaderInfoLog(shader);
  }
	//return
	return shader;
}

function createProgram(json){
  var program;
  if(json.hasOwnProperty('vs')){
    if(json.hasOwnProperty('fs')){
      //if vertex shader found
      var vs=getScriptInfo(json.vs);
      if(vs!=undefined){
        //if fragment shader found
        var fs=getScriptInfo(json.fs);
        if(fs!=undefined){
        	//init new program
        	program=gl.createProgram();
        	//create shader objects
        	var vshader=createShader(vs.src, gl.VERTEX_SHADER);
        	var fshader=createShader(fs.src, gl.FRAGMENT_SHADER);
        	//attach shader objects
        	gl.attachShader(program, vshader);
        	gl.attachShader(program, fshader);
        	//link program to the context
        	gl.linkProgram(program);
          //if something went wrong with linking the program
          if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
            throw gl.getProgramInfoLog(program);
          }
        }else{
          throw 'Cannot find fragment shader';
        }
      }else{
        throw 'Cannot find vertex shader';
      }
    }
  }
	//return
	return program;
}

//==HELPERS TO CREATE STANDARD WEB-GL SHAPES==

function screenQuad(){
  //create a new buffer
  var vertexPosBuffer = gl.createBuffer();
  //bind the buffer to the ARRAY_BUFFER of the context
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
  //define the 2d coordinates (vertices) of each point of a square,
  //where (-1,-1) is the first 2d coordinate
  var vertices = [-1, -1, 1, -1, -1, 1, 1, 1 ];
  /* Imagine these points on a coordinate grid,
    where (x-0, y-0) is the center of the canvas:

  +(-1, 1)		(-.5, 1)		(0, 1)		(.5, 1)		+(1, 1)
  (-1, .5)	(-.5, .5)		(0, .5)		(.5, .5)	(1, .5)
  (-1, 0)		(-.5, 0)		(0, 0)		(.5, 0)		(1, 0)
  (-1, -.5)	(-.5, -.5)	(0, -.5)	(.5, -.5)	(1, -.5)
  +(-1, -1)	(-.5, -1)		(0, -1)		(.5, -1)	+(1, -1)

  */
  //Fill the buffer with data at the ARRAY_BUFFER bind point
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  //how many numbers define one vertex coordinate
  vertexPosBuffer.itemSize = 2;
  //the shape's number of vertices (4 vertices for a rectangle or square)
  vertexPosBuffer.numItems = 4;
  //return the vertex buffer object (VBO)
  return vertexPosBuffer;
}
