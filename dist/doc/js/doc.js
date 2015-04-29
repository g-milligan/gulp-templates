jQuery(document).ready(function(){
  var wraps=jQuery('.docWrap').not('.init');
  wraps.each(function(){
    var wrap=jQuery(this); wrap.addClass('init');
    //***
  });
});
