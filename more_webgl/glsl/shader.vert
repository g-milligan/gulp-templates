attribute vec3 aVertexPosition;

uniform mat4 uMVMatrix; //uniform model-view matrix (original position)
uniform mat4 uPMatrix; //uniform projection matrix (perspective and distance skew)

void main(void) {
    /*calculate the position of a vertex by multiplying matrices:
      perspective-distance X original position X new position (aVertexPosition, set in JavaScript)
    */
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
