//sets the screen mode, "small", "fill", or "full"
var canvas_resize_timeout;
function setScreenMode(wrap,mode){
  var ret=1;
  if(wrap!=undefined){
    //set default screen mode
    ret=1;
    //if the screen mode isn't set yet
    if(!wrap.hasOwnProperty('screenMode')){
      //set default screen mode
      wrap['screenMode']=ret;
    }
    //if a screen mode was passed
    if(mode!==undefined){
      //convert string mode to the integer code
      if(typeof mode=='string'){
        mode=mode.toLowerCase();
        switch(mode){
          case 'small': mode=1; break;
          case 'fill': mode=2; break;
          case 'full': mode=3; break;
          default: mode=-1; break;
        }
      }
      //if mode is valid (between 1 and 3)
      if(mode>0){
        if(mode<4){
          //decide which class to restore
          switch(mode){
            case 1:
              removeClass(wrap,'gl-fill-screen');
              addClass(wrap,'gl-small-screen');
              wrap['screenMode']=ret=mode;
              break;
            case 2:
              removeClass(wrap,'gl-small-screen');
              addClass(wrap,'gl-fill-screen');
              wrap['screenMode']=ret=mode;
              break;
            case 3:
              setCanvasFullscreen(wrap);
              ret=mode;
              break;
          }
          //update inline height css
          setCanvasFill(wrap);
          //after a delay
          clearTimeout(canvas_resize_timeout);
          canvas_resize_timeout=setTimeout(function(){
            //call the function to handle canvas resize
            onCanvasResize();
          },800);
        }
      }
    }
  }
  return ret;
}
//open the canvas in full screen
function setCanvasFullscreen(wrap){
  var data=getCanvasData(wrap);
  if(data!=undefined){
    if(data.canvas.requestFullscreen){
      data.canvas.requestFullscreen();
    }else if(data.canvas.webkitRequestFullscreen){
      data.canvas.webkitRequestFullscreen();
    }else if(data.canvas.mozRequestFullscreen){
      data.canvas.mozRequestFullscreen();
    }else if(data.canvas.msRequestFullscreen){
      data.canvas.msRequestFullscreen();
    }
  }
}
//make sure the canvas height is correct; below the top band, but filling the screen otherwise
function setCanvasFill(wrap){
  var data=getCanvasData(wrap);
  if(data!=undefined){
    //if in fill screen mode
    if(hasClass(wrap,'gl-fill-screen')){
      //set the height to fill the screen but not go under the top bar
      var barHeight=data.modesWrap.clientHeight;
      var windowHeight=window.innerHeight;
      css(wrap,'height', (windowHeight-barHeight)+'px');
    }else{
      //NOT in fill screen mode...

      css(wrap,'height', '');
    }
  }
}
