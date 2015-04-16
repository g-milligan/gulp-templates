function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.clientWidth;
        gl.viewportHeight = canvas.clientWidth;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


var shaderProgram;

function initShaders() {
    var fragmentShader = getShader(gl, "f-shader");
    var vertexShader = getShader(gl, "v-shader");

    /*A program is a bit of code that lives on the WebGL side of the system;
    can run on the graphics card. A program is made up of two shaders
      1) fragment shader 2) vertex shader*/
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}


var mvMatrix = mat4.create();
var pMatrix = mat4.create();

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}



var triangleVertexPositionBuffer;
var squareVertexPositionBuffer;

function initBuffers() {
    triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    var vertices = [
         0.0,  1.0,  0.0, //top center (x,y,z)
        -1.0, -1.0,  0.0, //bottom left
         1.0, -1.0,  0.0 //bottom right
    ];
    //fill the "current" buffer, defined during the bindBuffer function
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    //"items" in itemSize and numItems refers to vertexes.
    //"size" refers to number of coordinate numbers that represent a single vertex.
    triangleVertexPositionBuffer.itemSize = 3; //three numbers per vertex (x,y,z)
    triangleVertexPositionBuffer.numItems = 3; //three vertices

    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    vertices = [
         1.0,  1.0,  0.0, //top right
        -1.0,  1.0,  0.0, //top left
         1.0, -1.0,  0.0, //bottom right
        -1.0, -1.0,  0.0 //bottom left
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;
}


function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    //get ready to draw color and depth
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    /*Note: A "projection" matrix is used to alter the model-view matrix
    (current position) in order to satisfy the perspective and distance of
    the object from the camera.*/

    //In order to make things that are further away look smaller, perspective must be defined
    /*([45 degrees, field of view],
      [width/height ratio],
      [hide things closer than .1 units],
      [hide things farther than 100 units],
      [pMatrix=projection matrix])*/
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    /*A matrix of numbers is used to represent the position of objects in 3d space.
    The "current" position of an object, CURRENT, is represented by a
    "model-view" matrix. However, the object needs to start somewhere, so the initial,
    ORIGIN matrix is set here at (0,0,0), by identity();
    mvMatrix is bound as the model-view matrix, or, identity matrix here.*/
    mat4.identity(mvMatrix);

    /*multiply the origin matrix by a "translate" matrix (translate=move)
    -1.5 units (x=move left), 0 units (y=neither up nor down), -7 units (z=move forward)
    */
    mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);

    //bind the TRIANGLE's buffer so that we can draw vertices (ARRAY_BUFFER) to the triangle
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    //send the javascript changes, to the matrix, to the graphics card
    setMatrixUniforms();
    /*Now, WebGL has an array of numbers that it knows should be treated as vertex positions,
    and it knows about our matrices.
    drawArrays() tells webgl what to do with the martices...
    draw each vertex, from the first (index=0) to the last, (index before numItems).
    Draw vertices as triangles.*/
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

    /*move square 3 units x right, 0 units y, 0 units z.
    This is relative to our previous call of translate, so when translate is called
    again, it's relative to the last position.
    The square ends up at (1.5, 0, -7)*/
    mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);

    //queu square buffer for draw data
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);


    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();

    /*Notice this time, gl.TRIANGLE_STRIP is used instead of gl.TRIANGLES.
    A strip of triangles makes the square (two triangles pushed together form the square).
    In more complex cases, it can be a really useful way of specifying a complex
    surface in terms of the triangles that approximate it.*/
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}



function webGLStart() {
    var canvas = document.getElementById("canvas");
    initGL(canvas);
    initShaders();
    initBuffers();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST); //enable removing things that get hidden behind other things to save processing

    drawScene();
}
