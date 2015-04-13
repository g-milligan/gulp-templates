//==ERROR EVENT==

window.onerror=function(msg,url,lineno){
  console.log(url+' ('+lineno+'): '+msg);
};

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
