/* =======
MAIN LOGIC
========== */

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

    //create a program and add shaders to it
    new_program(ctx);
    var vshader = add_vshader(ctx,'square');
    var fshader = add_fshader(ctx,'white');
    var program = bind_program(ctx);

    //if the program was created without incident
    if(program){
      //run the program
      ctx.useProgram(program);
      vertexPositionAttribute = ctx.getAttribLocation(program, "aVertexPosition");
      ctx.enableVertexAttribArray(vertexPositionAttribute);

      //////////////////////

      // Create a buffer for the square's vertices.

      squareVerticesBuffer = ctx.createBuffer();

      // Select the squareVerticesBuffer as the one to apply vertex
      // operations to from here out.

      ctx.bindBuffer(ctx.ARRAY_BUFFER, squareVerticesBuffer);

      // Now create an array of vertices for the square. Note that the Z
      // coordinate is always 0 here.

      var vertices = [
        1.0,  1.0,  0.0,
        -1.0, 1.0,  0.0,
        1.0,  -1.0, 0.0,
        -1.0, -1.0, 0.0
      ];

      // Now pass the list of vertices into WebGL to build the shape. We
      // do this by creating a Float32Array from the JavaScript array,
      // then use it to fill the current vertex buffer.

      ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(vertices), ctx.STATIC_DRAW);

      ///////////////////

      var drawScene=function() {
        // Clear the canvas before we start drawing on it.

        ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);

        // Establish the perspective with which we want to view the
        // scene. Our field of view is 45 degrees, with a width/height
        // ratio of 640:480, and we only want to see objects between 0.1 units
        // and 100 units away from the camera.

        perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);

        // Set the drawing position to the "identity" point, which is
        // the center of the scene.

        loadIdentity();

        // Now move the drawing position a bit to where we want to start
        // drawing the square.

        mvTranslate([-0.0, 0.0, -6.0]);

        // Draw the square by binding the array buffer to the square's vertices
        // array, setting attributes, and pushing it to ctx.

        ctx.bindBuffer(ctx.ARRAY_BUFFER, squareVerticesBuffer);
        ctx.vertexAttribPointer(vertexPositionAttribute, 3, ctx.FLOAT, false, 0, 0);
        setMatrixUniforms(ctx,program);
        ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, 4);
      }

      //////////////////

      setInterval(drawScene, 15);
    }
  }
}

//
// Matrix utility functions
//

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms(ctx,program) {
  var pUniform = ctx.getUniformLocation(program, "uPMatrix");
  ctx.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = ctx.getUniformLocation(program, "uMVMatrix");
  ctx.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}
