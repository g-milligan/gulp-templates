/*
GOAL: Draw the same square, but use a different shader to make it gradient-colored
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

	//4) define the 2d coordinates (vertices) of each point of a square

		//in webgl, there are x,y,z coordinates.
			//X = Left --> Right, 0 --> 1
			//Y = Bottom --> Top, 0 --> 1
			//Z = Near --> Far, 0 --> -1 (far away is negative, behind would be positive)

		//Drawing square points.
		//The order of the points matters so that the correct space is filled in.
		//Each point, a part of one triangle (within the square), must be grouped together.
		//Plot the coordinates of individual triangles, within the square, one at a time
		var vertices = [
			-1, -1, //bottom left point (x,y)
			1, -1, //bottom right point (x,y)
			-1, 1, //top left point (x,y)
			1, 1 //top right point (x, y)
		];

		/* Imagine these points on a coordinate grid, where (x-0, y-0) is the center of the canvas:

		+(-1, 1)		(-.5, 1)		(0, 1)		(.5, 1)		+(1, 1)
		(-1, .5)	(-.5, .5)		(0, .5)		(.5, .5)	(1, .5)
		(-1, 0)		(-.5, 0)		(0, 0)		(.5, 0)		(1, 0)
		(-1, -.5)	(-.5, -.5)	(0, -.5)	(.5, -.5)	(1, -.5)
		+(-1, -1)	(-.5, -1)		(0, -1)		(.5, -1)	+(1, -1)

		*/

	//5) Fill the buffer with data at the ARRAY_BUFFER bind point

		//the javascript array is cast into a Float32Array data object

		//STATIC_DRAW means that the data fills the buffer only once.
		//Multiple draws occur to keep the same data/image visible.

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

		//define some custom properties to hold key values
		vertexPosBuffer.itemSize = 2; //how many numbers define one vertex coordinate
		vertexPosBuffer.numItems = 4; //the shape's number of vertices

	//6) Create a program from our two shaders.
	//Remember, a program is the combination of a compiled VERTEX and a FRAGMENT shader

		//create the program from the vertex and fragment shader code
		var program = createProgram(function(){/*
				attribute vec2 aVertexPosition;
				//a varying type can be used in both vertex and fragment shader
				//if it is given the same name in both shader programs
				varying vec2 vTextCoord;
				void main(){
					vTextCoord = aVertexPosition; //the texture (color) corresponds to the position
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

	//7) Enable drawing, then draw...

		//Set the value, "pos", defined in the shader program, to the javascript custom myOwnVertexPosAttrib property
		program.myOwnVertexPosAttrib = gl.getAttribLocation(program, 'aVertexPosition');

		//Enable the storing of attribute data in the myOwnVertexPosArray. You must enable an attribute before you can use it in a shader.
		gl.enableVertexAttribArray(program.myOwnVertexPosArray);

		//([attribute-to-define], [vertex-size], [data-type], [normalize-vertices?], [no-vertex-stride], [no-vertex-offset])
		gl.vertexAttribPointer(program.myOwnVertexPosAttrib, vertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0);

		//draw (triangles, [no-offset], [3-vertices])
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPosBuffer.numItems);

			//this time use TRIANGLE_STRIP instead of TRIANGLES and increase the number of vertices to 4 instead of 3

			//gl.POINTS, gl.LINES, gl.LINE_LOOP, gl.LINE_STRIP, gl.TRIANGLES, gl.TRIANGLE_STRIP, gl.TRIANGLE_FAN

		//Notice how some properties begin with "myOwn".
		//This shows that I decided what to call these properties.
		//Their name doesn't matter, they are just needed to hold data.

}
