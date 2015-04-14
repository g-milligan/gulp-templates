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
