var canvas=document.getElementById('canvas');
var gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');

gl.clearColor(0,0,.6,1);
gl.clear(gl.COLOR_BUFFER_BIT);
