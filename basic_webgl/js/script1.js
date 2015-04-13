/*
	GOAL: Set a red background color
*/

//==GLOBAL VALUES==

var canvas;
var gl;

//==MAIN LOGIC==

function docLoad(){

  //1) initialize canvas and gl context

  canvas=document.getElementById('canvas');
  gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');

  //2) set a background color

  gl.clearColor(.6,0,0,1); // clearColor(red, green, blue, alpha-opacity)

  //3) show the background color by clearing a buffer

  gl.clear(gl.COLOR_BUFFER_BIT); //3 types of buffer bits: COLOR_BUFFER_BIT, STENCIL_BUFFER_BIT, DEPTH_BUFFER_BIT


}
