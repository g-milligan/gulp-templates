var minifyCode=false;

//===============================================

var gulp = require('gulp');
/*
note: to install additional required node plugins run command

  FORMAT:
    npm install gulp {plugin-name} --save-dev
  EXAMPLE:
    npm install gulp gulp-concat --save-dev

*/
var fs = require('fs');
var gutil = require('gulp-util');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var htmlStr, htmlChangeTrigger;
var htmlReloadTasks=['start', 'compile-css', 'compile-js', 'compile-vertex-shaders', 'compile-fragment-shaders'];
//load the html string that will modified by having external file content combined-inserted into it
var loadHtmlStr=function(loadTrigger){
  //if the html isn't loaded yet
  if(htmlStr==undefined){
    //if the dist directory doesn't exist yet
    if (!fs.existsSync('./dist/')){
      //create dist directory
      fs.mkdirSync('./dist/');
    }
    //if the dist/index.html file doesn't exist yet
    if(!fs.existsSync('./dist/index.html')){
      //get the html from the template.html file
      htmlStr=fs.readFileSync('template.html', 'utf8');
    }else{
      //trigger may have originated from template change
      if(loadTrigger==='start'){
        //get the html from the template.html file
        htmlStr=fs.readFileSync('template.html', 'utf8');
      }else{
        //dist/index.html exists... get the html from the file
        htmlStr=fs.readFileSync('./dist/index.html', 'utf8');
      }
    }
    //if the change trigger is not yet set
    if(htmlChangeTrigger==undefined){
      //remember which load trigger loaded the html
      htmlChangeTrigger=loadTrigger;
    }
  }
};
//when the htmlStr has all of the updated file content inserted, write this changed string into the file
var writeHtmlStr=function(callTrigger){
  //if this is the correct end action to trigger the finishing write event
  if(callTrigger===htmlChangeTrigger){
    //write the modified html to the file
    fs.writeFileSync('./dist/index.html', htmlStr);
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++');
    console.log('+++ HTML updated after "'+htmlChangeTrigger+'" +++');
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++');
    //reset the html for next time
    htmlStr=undefined;
    //reset the trigger for next time
    htmlChangeTrigger=undefined;
    //reload the browser
    browserSync.reload();
  }
};
//insert the external file content into the html depending on the location of placement tokens
var insertIntoHtml=function(html,path,allowedExt){
  //for each file in the target directory
  var files = fs.readdirSync(path);
  for(var f=0;f<files.length;f++){
    var file=files[f]; var isAllowedExt=false;
    //if there is an array of allowed extensions
    if(allowedExt!=undefined){
      //if the array has more than zero items
      if(allowedExt.length>0){
        //for each allowed extension
        for(var a=0;a<allowedExt.length;a++){
          var ext=allowedExt[a]; ext=ext.toLowerCase();
          //if the file name ends in this extension
          if(file.toLowerCase().lastIndexOf(ext)==file.length-ext.length){
            //yes, this is an allowed extension, stop checking for other allowed
            isAllowedExt=true;
            break;
          }
        }
      }else{
        isAllowedExt=true;
      }
    }else{
      isAllowedExt=true;
    }
    //if this file has an allowed extension
    if(isAllowedExt){
      //indicators for start and end of the string to insert
      var startToken='['+file+']';
      var endToken='[/'+file+']';
      //if both start and end tokens are in the file
      if(html.indexOf(startToken)!==-1){
        if(html.indexOf(endToken)!==-1){
          //get the file content
          var content=fs.readFileSync(path+file, 'utf8');
          var startIndex=0;
          //get the string before and including the line that contains the starting insert token
          var parts=html.split(startToken);
          if(parts.length>1){
            //get the string before the content to replace
            var beforeReplace=html.substring(0,parts[0].length+startToken.length);
            var beforeNewline=html.substring(beforeReplace.length);
            beforeNewline=beforeNewline.substring(0,beforeNewline.indexOf("\n")+1);
            beforeReplace+=beforeNewline;
            //split off the string after the end token
            var moreParts=parts[1].split(endToken);
            var replaceThis=moreParts[0];
            //remove first newline
            replaceThis=replaceThis.substring(replaceThis.indexOf("\n")+1);
            //remove last newline
            replaceThis=replaceThis.substring(0,replaceThis.lastIndexOf("\n"));
            //get the string after the replaceThis string
            var afterReplace=html.substring(beforeReplace.length+replaceThis.length);
            //replace the string
            html=beforeReplace+content+afterReplace;
          }
        }
      }
    }
  }
  return html;
};
gulp.task('start', function(){
  //set the final task that will trigger the insert html write finisher
  htmlChangeTrigger=htmlReloadTasks[htmlReloadTasks.length-1];
  loadHtmlStr('start');
});
gulp.task('compile-css', function() {
  loadHtmlStr('compile-css');
  htmlStr=insertIntoHtml(htmlStr, './css/', ['.css']);
  writeHtmlStr('compile-css');
});
gulp.task('compile-js', function() {
  loadHtmlStr('compile-js');
  htmlStr=insertIntoHtml(htmlStr, './js/', ['.js']);
  writeHtmlStr('compile-js');
});
gulp.task('compile-vertex-shaders', function() {
  loadHtmlStr('compile-vertex-shaders');
  htmlStr=insertIntoHtml(htmlStr, './glsl/', ['.vert']);
  writeHtmlStr('compile-vertex-shaders');
});
gulp.task('compile-fragment-shaders', function() {
  loadHtmlStr('compile-fragment-shaders');
  htmlStr=insertIntoHtml(htmlStr, './glsl/', ['.frag']);
  writeHtmlStr('compile-fragment-shaders');
});
//page reload triggers
gulp.task('html-reload', htmlReloadTasks);
gulp.task('css-reload', ['compile-css']);
gulp.task('js-reload', ['compile-js']);
gulp.task('vertex-shader-reload', ['compile-vertex-shaders']);
gulp.task('fragment-shader-reload', ['compile-fragment-shaders']);
//server task
gulp.task('serve', htmlReloadTasks, function() {
    //serve files from the root of this project distribution
    browserSync({
        server: {
            baseDir: "dist"
        }
    });
    //AUTO RELOAD: while the server runs...
    gulp.watch("js/*.js", ['js-reload']);
    gulp.watch("glsl/*.vert", ['vertex-shader-reload']);
    gulp.watch("glsl/*.frag", ['fragment-shader-reload']);
    gulp.watch("template.html", ['html-reload']);
    gulp.watch("css/*.css", ['css-reload']);
});
//the default action will open a browser window for the index.html file
gulp.task('default', ['serve']);
