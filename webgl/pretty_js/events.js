/* ================
TRIGGER MAIN EVENTS
=================== */

//when the document is ready
document.addEventListener('DOMContentLoaded', function(){

  //...

  //handle window resize
  var handle_resize=function(){
    //...
    console.log('window width '+window.innerWidth);
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
