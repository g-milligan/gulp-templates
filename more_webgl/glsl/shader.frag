precision mediump float;

varying vec2 vTextCoord;

void main(){
  gl_FragColor = vec4(vTextCoord, 0, 1); //varying color
}
