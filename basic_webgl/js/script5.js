/*
GOAL: Offset the amount of yellow in the color gradient.
Demonstrate how to edit fragment shader color by using a constant (uniform) value.
*/

//==GLOBAL VALUES==

var canvas;
var gl;

//==MAIN LOGIC==

function docLoad(){

  //1) initialize canvas and gl context

	  canvas=document.getElementById('canvas');
	  gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');

  //2) create a new buffer

		var vertexPosBuffer = gl.createBuffer();

	//3) bind the buffer to the ARRAY_BUFFER of the context

		gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);

	//4) define the 2d coordinates (vertices) of each point of a square, where (-1,-1) is the first coordinate

		var vertices = [-1, -1, 1, -1, -1, 1, 1, 1 ];

		/* Imagine these points on a coordinate grid, where (x-0, y-0) is the center of the canvas:

		+(-1, 1)		(-.5, 1)		(0, 1)		(.5, 1)		+(1, 1)
		(-1, .5)	(-.5, .5)		(0, .5)		(.5, .5)	(1, .5)
		(-1, 0)		(-.5, 0)		(0, 0)		(.5, 0)		(1, 0)
		(-1, -.5)	(-.5, -.5)	(0, -.5)	(.5, -.5)	(1, -.5)
		+(-1, -1)	(-.5, -1)		(0, -1)		(.5, -1)	+(1, -1)

		*/

	//5) Fill the buffer with data at the ARRAY_BUFFER bind point

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

		//define some custom properties to hold key values
		vertexPosBuffer.itemSize = 2; //how many numbers define one vertex coordinate
		vertexPosBuffer.numItems = 4; //the shape's number of vertices
		var offset = [1, 1];

	//6) Create a program from our two shaders.

		//create the program from the vertex and fragment shader code
		var program = createProgram(function(){/*
				attribute vec2 aVertexPosition;

				//a varying type can be used in both vertex and fragment shader
				//if it is given the same name in both shader programs
				varying vec2 vTextCoord;

				//uniforms are a constant value, eg: a light source value
				uniform vec2 uOffset;

				void main(){
					vTextCoord = aVertexPosition + uOffset; //the texture (color) corresponds to the position
					gl_Position = vec4(aVertexPosition, 0, 1);
				}
		*/},function(){/*
				precision mediump float;

				varying vec2 vTextCoord;

				void main(){
					gl_FragColor = vec4(vTextCoord, 0, 1); //varying color
				}
		*/});

		//set the current program
		gl.useProgram(program);

	//7) get some pointers (linked to variables in the shader program)

		//Set the value, "pos", defined in the shader program, to the javascript custom myOwnVertexPosAttrib property
		program.myOwnVertexPosAttrib = gl.getAttribLocation(program, 'aVertexPosition');

		//get another variable, 'uOffset' from the shader program and store its pointer in program.myOwnOffsetUniform
		program.myOwnOffsetUniform = gl.getUniformLocation(program, 'uOffset');

	//8) Enable editing for required shader variable types

		//Enable the storing of attribute data in the myOwnVertexPosArray. You must enable an attribute before you can use it in a shader.
		gl.enableVertexAttribArray(program.myOwnVertexPosArray);

	//9) Edit shader variable values

		//([attribute-to-define], [vertex-size], [data-type], [normalize-vertices?], [no-vertex-stride], [no-vertex-offset])
		gl.vertexAttribPointer(program.myOwnVertexPosAttrib, vertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0);

		//passing two numbers to the uniform vec2 uOffset variable in the shader program
		gl.uniform2f(program.myOwnOffsetUniform, offset[0], offset[1]);

	//10) Draw the result of editing shader variable values

		//draw (triangles, [no-offset], [3-vertices])
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPosBuffer.numItems);

}
