var offset = [1, 1];

//create a 4-vertex (square/rectangle shape) buffer to draw on
var vertexPosBuffer = screenQuad();

//a program is defined as a combinitation of 1 vertex shader and 1 fragment shader
var program = createProgram({vs:'v-shader',fs:'f-shader'});
gl.useProgram(program);

//Set the value, "aVertexPosition", defined in the shader program, to the javascript custom myOwnVertexPosAttrib property
program.myOwnVertexPosAttrib = gl.getAttribLocation(program, 'aVertexPosition');

//get another variable, 'uOffset' from the shader program and store its pointer in program.myOwnOffsetUniform
program.myOwnOffsetUniform = gl.getUniformLocation(program, 'uOffset');

//Enable the storing of attribute data in the myOwnVertexPosArray. You must enable a VertexAttribArray before you can use it in a shader.
gl.enableVertexAttribArray(program.myOwnVertexPosArray);

//Edit shader variable values

//([attribute-to-define], [vertex-size], [data-type], [normalize-vertices?], [no-vertex-stride], [no-vertex-offset])
gl.vertexAttribPointer(program.myOwnVertexPosAttrib, vertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0);

//passing two numbers to the uniform vec2 uOffset variable in the shader program
gl.uniform2f(program.myOwnOffsetUniform, offset[0], offset[1]);

//draw (triangles, [no-offset], [3-vertices])
gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPosBuffer.numItems);
