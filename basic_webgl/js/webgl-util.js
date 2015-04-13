//==ERROR EVENT==

window.onerror=function(msg,url,lineno){
  console.log(url+' ('+lineno+'): '+msg);
};

//==EXTRACT SHADER PROGRAM STRINGS FROM FUNCTION BODY==

//a clever way of storing multi-line strings, in javascript, that can be easily accessed via a function call

//gets the contents of a function, eg: function functionName(){/* ...contents... */}
function getFuncStr(functionName){
	var functionContent = ''; var foundFunction=false;
	if(typeof functionName==='string'){
		//if this function exists
		if(window.hasOwnProperty(functionName)){
			//get code inside the function object
			functionContent = window[functionName];
			foundFunction=true;
		}
	}else if(typeof functionName==='function'){
		//get code inside the function object
		functionContent = functionName;
		foundFunction=true;
	}
	//if found function
	if(foundFunction){
		functionContent = functionContent.toString();
		//strip off the function string
		var startCode = '{/*';var endCode = '*/}';
		//safari tries to be helpful by inserting a ';' at the end of the function code if there is not already a ';'
		if (functionContent.lastIndexOf(endCode) == -1) {endCode='*/;}';}
		//strip off everything left of, and including startCode
		functionContent = functionContent.substring(functionContent.indexOf(startCode) + startCode.length);
		//strip off everything right of, and including endCode
		functionContent = functionContent.substring(0, functionContent.lastIndexOf(endCode));
		functionContent = functionContent.trim();
	}
	return functionContent;
}

//just call fs_str('shader-name') to get the FRAGMENT shader code as a string
function fs_str(shaderName){
	if(typeof shaderName==='string'){
		shaderName='fshader_'+shaderName;
	}
  return getFuncStr(shaderName);
}

//just call vs_str('shader-name') to get the VERTEX shader code as a string
function vs_str(shaderName){
	if(typeof shaderName==='string'){
		shaderName='vshader_'+shaderName;
	}
  return getFuncStr(shaderName);
}

//==HELPERS TO CREATE STANDARD WEB-GL PROGRAM/SHADER OBJECTS==

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

function createProgram(vstr,fstr){
	//if the vertex shader code is inside a function
	if(typeof vstr==='function'){
		//try to get the string from the function
		vstr=vs_str(vstr);
	}
	//if the fragment shader code is inside a function
	if(typeof fstr==='function'){
		//try to get the string from the function
		fstr=fs_str(fstr);
	}
	//init new program
	var program=gl.createProgram();
	//create shader objects
	var vshader=createShader(vstr, gl.VERTEX_SHADER);
	var fshader=createShader(fstr, gl.FRAGMENT_SHADER);
	//attach shader objects
	gl.attachShader(program, vshader);
	gl.attachShader(program, fshader);
	//link program to the context
	gl.linkProgram(program);
  //if something went wrong with linking the program
  if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
    throw gl.getProgramInfoLog(program);
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
