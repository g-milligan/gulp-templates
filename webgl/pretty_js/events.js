/* ================
TRIGGER MAIN EVENTS
=================== */

//when the document is ready
document.addEventListener('DOMContentLoaded', function(){
  //==SELECT KEY ELEMENTS==
  glCanvasList=[];
  var canvasWraps=document.body.getElementsByClassName('gl-canvas-wrap');
  //==INIT CANVAS WRAPS==
  var currentCanvasNum=1;
  for(var c=0;c<canvasWraps.length;c++){
    var canvasWrap=canvasWraps[c];
    //if wrap contains canvas
    var canvas=canvasWrap.getElementsByClassName('gl-canvas');
    if(canvas.length>0){
      canvas=canvas[0];
      //if this is a canvas element
      if(isTag(canvas,'canvas')){
        //if there is a screen modes wrap
        var screenModes=canvasWrap.getElementsByClassName('screen-modes');
        if(screenModes.length>0){
          screenModes=screenModes[0];
          //for each screen mode button
          var modeBtns=screenModes.getElementsByTagName('div'); mBtns=[];
          for(var m=0;m<modeBtns.length;m++){
            var modeBtn=modeBtns[m];
            if(hasClass(modeBtn,'small-screen')){
              modeBtn.onclick=function(){
                setScreenMode(canvasWrap,1);
              };
              mBtns.push(
              {
                1:{
                  btn:modeBtn,
                  key:'small-screen'
                }
              });
            }else if(hasClass(modeBtn,'fill-screen')){
              modeBtn.onclick=function(){
                setScreenMode(canvasWrap,2);
              };
              mBtns.push(
              {
                2:{
                  btn:modeBtn,
                  key:'fill-screen',
                }
              });
            }else if(hasClass(modeBtn,'full-screen')){
              modeBtn.onclick=function(){
                setScreenMode(canvasWrap,3);
              };
              mBtns.push(
              {
                3:{
                  btn:modeBtn,
                  key:'full-screen'
                }
              });
            }
            if(mBtns.length===3){
              break; //stop the loop
            }
          }
          //if all 3 screen mode buttons were found
          if(mBtns.length===3){
            canvasWrap['canvasId']=currentCanvasNum;
            currentCanvasNum++;
            //==INITIAL SCREEN MODE==
            var screenMode=function(mode){
              setScreenMode(canvasWrap,mode);
            };screenMode(1);
            //==SET THE GL CANVAS LIST OBJECT==
            glCanvasList.push({
              wrap:canvasWrap,
              canvas:canvas,
              setScreenMode:screenMode,
              getScreenMode:function(){
                var smode=1;
                if((screen.availHeight||screen.height-30)<=window.innerHeight){
                    // browser is almost certainly fullscreen
                    smode=3;
                }else{
                  //not in full screen, get the mode from the canvas wrap
                  smode=canvasWrap['screenMode'];
                }return smode;
              },
              modesWrap:screenModes,
              modeButtons:mBtns
            });
          }
        }
      }
    }
  }
  //set the list of validated canvas wrap objects
  document.body['glCanvasList']=glCanvasList;
  //handle window resize
  var handle_resize=function(){
    //make sure the canvas heights are correct
    for(var c=0;c<glCanvasList.length;c++){
      //set canvas fill height
      setCanvasFill(glCanvasList[c].wrap);
    }
  };
  window_resize(function(){
    //do once to prevent multiple success event triggers (on drag resize window)
    do_once(function(){
      handle_resize();
    });
  });
  //execute resize on load
  handle_resize();
  //end document ready
});
