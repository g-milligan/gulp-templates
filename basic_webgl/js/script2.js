/*
GOAL: Draw a green triangle
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

	//4) define the 2d coordinates (vertices) of each point of a triangle

		//in webgl, there are x,y,z coordinates.
			//X = Left --> Right, 0 --> 1
			//Y = Bottom --> Top, 0 --> 1
			//Z = Near --> Far, 0 --> -1 (far away is negative, behind would be positive)

		//drawing triangle points
		var vertices = [
			-.5, .5, //top left point (x,y)
			.5, .5, //top right point (x,y)
			0, -.5 //bottom point (x,y)
		];

		/* Imagine these points on a coordinate grid, where (x-0, y-0) is the center of the canvas:

		(-1, 1)		(-.5, 1)		(0, 1)		(.5, 1)		(1, 1)
		(-1, .5)	(-.5, .5)		(0, .5)		(.5, .5)	(1, .5)
		(-1, 0)		(-.5, 0)		(0, 0)		(.5, 0)		(1, 0)
		(-1, -.5)	(-.5, -.5)	(0, -.5)	(.5, -.5)	(1, -.5)
		(-1, -1)	(-.5, -1)		(0, -1)		(.5, -1)	(1, -1)
		*/

	//5) Fill the buffer with data at the ARRAY_BUFFER bind point

		//the javascript array is cast into a Float32Array data object

		//STATIC_DRAW means that the data fills the buffer only once.
		//Multiple draws occur to keep the same data/image visible.

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	//6) Create a program from our two shaders.
	//Remember, a program is the combination of a compiled VERTEX and a FRAGMENT shader

		//getting the shader code from our clever system of storing it inside function /* comments */

		//vertex shader code
		var vs=vs_str(function(){/*

			attribute vec2 pos;

			void main(){
				gl_Position = vec4(pos, 0, 1);
			}

		*/});

		/*
		mediump means medium precision for floating point numbers.
		all options include: "lowp", "mediump", "highp".
		only use highp in special cases since this would not be possible on some mobile phones, etc...
		*/

		//fragment shader code
		var fs=fs_str(function(){/*

			precision mediump float;

			void main(){
				gl_FragColor = vec4(0,.8,0,1);
			}

		*/});

		//create the program from the vertex and fragment shader code
		var program = createProgram(vs, fs);

		//set the current program
		gl.useProgram(program);

	//7) Enable drawing, then draw...

		//Set the value, "pos", defined in the shader program, to the javascript custom myOwnVertexPosAttrib property
		program.myOwnVertexPosAttrib = gl.getAttribLocation(program, 'pos');

		//Enable the storing of attribute data in the myOwnVertexPosArray. You must enable an attribute before you can use it in a shader.
		gl.enableVertexAttribArray(program.myOwnVertexPosArray);

		//([attribute-to-define], [vertex-size], [data-type], [normalize-vertices?], [no-vertex-stride], [no-vertex-offset])
		//the vertices are size 2 = X and Y coordinates, 2-dimensional
		gl.vertexAttribPointer(program.myOwnVertexPosAttrib, 2, gl.FLOAT, false, 0, 0);

		//draw (triangles, [no-offset], [3-vertices])
		gl.drawArrays(gl.TRIANGLES, 0, 3);

			//gl.POINTS, gl.LINES, gl.LINE_LOOP, gl.LINE_STRIP, gl.TRIANGLES, gl.TRIANGLE_STRIP, gl.TRIANGLE_FAN

		//Notice how some properties begin with "myOwn".
		//This shows that I decided what to call these properties.
		//Their name doesn't matter, they are just needed to hold data.

}
