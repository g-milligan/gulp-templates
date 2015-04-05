//sets the screen mode, "small", "fill", or "full"
function setScreenMode(wrap,mode){
  if(wrap!=undefined){
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
          //get elems
          var bodyElem=document.body;
          var screenModesWrap=wrap.getElementsByClassName('screen-modes')[0];
          //*** reset active class from each of the screen mode buttons
          //reset remove all mode classes
          removeClass(bodyElem,'gl-small-screen');
          removeClass(bodyElem,'gl-fill-screen');
          removeClass(bodyElem,'gl-full-screen');
          //decide which class to restore
          switch(mode){
            case 1:
              addClass(bodyElem,'gl-small-screen');
              break;
            case 2:
              addClass(bodyElem,'gl-fill-screen');
              break;
            case 3:
              addClass(bodyElem,'gl-full-screen');
              break;
          }
        }
      }
    }
  }
}
