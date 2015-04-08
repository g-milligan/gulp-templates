//sets the screen mode, "small", "fill", or "full"
function setScreenMode(wrap,mode){
  var ret=1;
  if(wrap!=undefined){
    //set default screen mode
    wrap['screenMode']=ret=1;
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
          //set screen mode to return
          wrap['screenMode']=ret=mode;
          //reset remove all mode classes
          removeClass(wrap,'gl-small-screen');
          removeClass(wrap,'gl-fill-screen');
          removeClass(wrap,'gl-full-screen');
          //decide which class to restore
          switch(mode){
            case 1:
              addClass(wrap,'gl-small-screen');
              break;
            case 2:
              addClass(wrap,'gl-fill-screen');
              break;
            case 3:
              addClass(wrap,'gl-full-screen');
              break;
          }
          //update inline height css
          setCanvasFill(wrap);
        }
      }
    }
  }
  return ret;
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
