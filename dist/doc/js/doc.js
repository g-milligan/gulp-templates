jQuery(document).ready(function(){
  //for each div.docWrap, not already initialized
  var wraps=jQuery('.docWrap').not('.init');
  wraps.each(function(){
    var wrap=jQuery(this); wrap.addClass('init');
    //***
  });
});
