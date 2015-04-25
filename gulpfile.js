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
var argv = require('yargs').argv;
//var uglify = require('gulp-uglify');
//var gulpif = require('gulp-if');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var htmlStr, htmlChangeTrigger, projectFiles, setNewProjName;
var htmlReloadTasks=['start', 'compile-html', 'compile-txt', 'compile-css', 'compile-js', 'compile-vertex-shaders', 'compile-fragment-shaders'];
var htmlReloadFunctions={};

var startProjFiles='<!-- [@project]';
var endProjFiles='[/@project] -->';
//get the json key arg name input in the terminal like "gulp {task} --{arg}"
var getYargKey=function(argv,defaultVal){
  var ret;
  //try to get the file name from argv
  for(var key in argv){
    if(argv.hasOwnProperty(key)){
      if(key.length>0&&key.indexOf('$')!==0&&key.indexOf('_')!==0){
        //use this param name as the fileName
        ret=key;
        break;
      }
    }
  }
  if(ret==undefined){
    ret=defaultVal;
  }
  return ret;
};
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
    //init an empty array of project files
    projectFiles=[];
  }
};
//get the project files from an html string, return string object
var getProjectFilesStr=function(html){
  var jsonStr;
  if(html.lastIndexOf(startProjFiles)!==-1){
    if(html.lastIndexOf(endProjFiles)!==-1){
      jsonStr=html.substring(html.lastIndexOf(startProjFiles)+startProjFiles.length);
      jsonStr=jsonStr.substring(0,jsonStr.lastIndexOf(endProjFiles));
      jsonStr=jsonStr.trim();
    }
  }
  return jsonStr;
};
//get the project files from an html string, return json object
var getProjectFilesJson=function(html){
  var json;
  var jsonStr=getProjectFilesStr(html);
  if(jsonStr!=undefined){
    json=JSON.parse(jsonStr);
  }
  return json;
};
//when the htmlStr has all of the updated file content inserted, write this changed string into the file
var writeHtmlStr=function(callTrigger){
  //if this is the correct end action to trigger the finishing write event
  if(callTrigger===htmlChangeTrigger){
    //write the inserted project files into the htmlStr
    projList=insertProjectFilesList(htmlStr,projectFiles);
    htmlStr=projList.newHtml;
    //write the modified html to the file
    fs.writeFileSync('./dist/index.html', htmlStr);
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++');
    console.log('+++ HTML updated after "'+htmlChangeTrigger+'" +++');
    console.log('COMBINED('+projectFiles.length+'): '+projList.projectListStr);
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++');
    //reset the project files list for next time
    projectFiles=undefined;
    //reset the html for next time
    htmlStr=undefined;
    //reset the trigger for next time
    htmlChangeTrigger=undefined;
    //reload the browser
    browserSync.reload();
  }
};
//get the start/end token for inserted file content
var getStartToken=function(fname){
  return '['+fname+']';
};
var getEndToken=function(fname){
  return '[/'+fname+']';
};
//get the content in three parts 1) before insert content 2) insert content 3) after insert content
var getSplitContent=function(html,fname){
  var returnParts;
  //indicators for start and end of the string to insert
  var startToken=getStartToken(fname);
  var endToken=getEndToken(fname);
  //if both start and end tokens are in the file
  if(html.indexOf(startToken)!==-1){
    if(html.indexOf(endToken)!==-1){
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
        //assemble the three parts
        returnParts=[beforeReplace,replaceThis,afterReplace];
      }
    }
  }
  return returnParts;
};
//remove <!-- [@project] ... [/@project] --> from the html string
var removeProjectFilesJson=function(html){
  //remove the project files from the htmlStr
  if(html.lastIndexOf(startProjFiles)!==-1){
    if(html.lastIndexOf(endProjFiles)!==-1){
      //remove the project files from the htmlStr
      var beforeProjFiles=html.substring(0,html.lastIndexOf(startProjFiles));
      var afterProjFiles=html.substring(html.lastIndexOf(endProjFiles)+endProjFiles.length);
      html=beforeProjFiles+afterProjFiles;
    }
  }
  return html;
};
//insert a list of project files that can be used to "unpack" the separate files from the single distribution .html file
var insertProjectFilesList=function(html,filesList){
  var ret={newHtml:'',projectListStr:''};
  var closeBody='</body>'; var projListStr='';
  //if there is a closing body tag in there
  if(html.indexOf(closeBody)!==-1){
    //remove <!-- [@project] ... [/@project] --> from the html string
    html=removeProjectFilesJson(html);
    //if there are any project files
    if(filesList!=undefined&&filesList.length>0){
      //for each project file
      for(var p=0;p<filesList.length;p++){
        var file=filesList[p];
        if(p!==0){projListStr+=', ';}
        if(file.indexOf('./')===0){file=file.substring('./'.length);}
        projListStr+='"'+file+'"';
      }
      //get the project properties from the existing index.html file, if one exists
      var prevProjJson;
      if(fs.existsSync('./dist/index.html')){
        //get the html of the current unpacked project (this one)
        var indexHtml=fs.readFileSync('./dist/index.html', 'utf8');
        prevProjJson=getProjectFilesJson(indexHtml);
      }
      //restore project properties, like project name
      var projName=''; var retProjName='';
      if(prevProjJson!=undefined){
        //if there was already a project name, restore the project name
        if(prevProjJson.hasOwnProperty('name')){
          retProjName=prevProjJson.name;
          projName='"name":"'+retProjName+'", ';
        }
      }
      //overwrite project properties, like project name
      if(setNewProjName!=undefined){
        //set new project name
        retProjName=setNewProjName;
        setNewProjName=undefined;
        projName='"name":"'+retProjName+'", ';
      }
      //insert the project files list string before the closing body tag
      var beforeClose=html.substring(0,html.lastIndexOf(closeBody));
      var atClose=html.substring(html.lastIndexOf(closeBody));
      html=beforeClose+startProjFiles+'{'+projName+'"files":['+projListStr+']}'+endProjFiles+atClose;
    }
  }
  ret.newHtml=html;
  ret.projectListStr=projListStr;
  ret.projectName=retProjName;
  return ret;
};
//insert the external file content into the html depending on the location of placement tokens
var insertIntoHtml=function(html,path,allowedExt,deleteIfNotInTemplate){
  if(deleteIfNotInTemplate==undefined){deleteIfNotInTemplate=true;}
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
      //if there is a file section inserted in the html
      var contentParts=getSplitContent(html,file);
      if(contentParts!=undefined){
        //get the file content
        var content=fs.readFileSync(path+file, 'utf8');
        //replace the string, contentParts[1]
        html=contentParts[0]+content+contentParts[2];
        //record this as one of the project files
        projectFiles.push(path+file);
      }else{
        //this file exists in the folder but isn't embedded in the template.html...

        if(deleteIfNotInTemplate){
          //delete this file because it isn't embedded in template.html
          fs.unlinkSync(path+file);
        }
      }
    }
  }
  return html;
};
//start
htmlReloadFunctions['start']=function(){
  //set the final task that will trigger the insert html write finisher
  htmlChangeTrigger=htmlReloadTasks[htmlReloadTasks.length-1];
  loadHtmlStr('start');
};
gulp.task('start', function(){
  htmlReloadFunctions['start']();
});
//compile-html
htmlReloadFunctions['compile-html']=function(){
  loadHtmlStr('compile-html');
  htmlStr=insertIntoHtml(htmlStr, './html/', ['.html']);
  writeHtmlStr('compile-html');
};
gulp.task('compile-html', function() {
  htmlReloadFunctions['compile-html']();
});
//compile-txt
htmlReloadFunctions['compile-txt']=function(){
  loadHtmlStr('compile-txt');
  htmlStr=insertIntoHtml(htmlStr, './txt/', ['.txt']);
  writeHtmlStr('compile-txt');
};
gulp.task('compile-txt', function() {
  htmlReloadFunctions['compile-txt']();
});
//compile-css
htmlReloadFunctions['compile-css']=function(){
  loadHtmlStr('compile-css');
  htmlStr=insertIntoHtml(htmlStr, './css/', ['.css']);
  writeHtmlStr('compile-css');
};
gulp.task('compile-css', function() {
  htmlReloadFunctions['compile-css']();
});
//compile-js
htmlReloadFunctions['compile-js']=function(){
  loadHtmlStr('compile-js');
  htmlStr=insertIntoHtml(htmlStr, './js/', ['.js']);
  writeHtmlStr('compile-js');
};
gulp.task('compile-js', function() {
  htmlReloadFunctions['compile-js']();
});
//compile-vertex-shaders
htmlReloadFunctions['compile-vertex-shaders']=function(){
  loadHtmlStr('compile-vertex-shaders');
  htmlStr=insertIntoHtml(htmlStr, './glsl/', ['.vert']);
  writeHtmlStr('compile-vertex-shaders');
};
gulp.task('compile-vertex-shaders', function() {
  htmlReloadFunctions['compile-vertex-shaders']();
});
//compile-fragment-shaders
htmlReloadFunctions['compile-fragment-shaders']=function(){
  loadHtmlStr('compile-fragment-shaders');
  htmlStr=insertIntoHtml(htmlStr, './glsl/', ['.frag']);
  writeHtmlStr('compile-fragment-shaders');
};
gulp.task('compile-fragment-shaders', function() {
  htmlReloadFunctions['compile-fragment-shaders']();
});
//page reload triggers
gulp.task('template-reload', htmlReloadTasks);
gulp.task('html-reload', ['compile-html']);
gulp.task('txt-reload', ['compile-txt']);
gulp.task('css-reload', ['compile-css']);
gulp.task('js-reload', ['compile-js']);
gulp.task('vertex-shader-reload', ['compile-vertex-shaders']);
gulp.task('fragment-shader-reload', ['compile-fragment-shaders']);
var gulpServe=function(){
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
  gulp.watch("template.html", ['template-reload']);
  gulp.watch("css/*.css", ['css-reload']);
  gulp.watch("html/*.html", ['html-reload']);
  gulp.watch("txt/*.txt", ['txt-reload']);
};
//server task
gulp.task('serve', htmlReloadTasks, function() {
  gulpServe();
});
//updates/compiles current index.html packages then renames the index.html to a new package name
var gulpPack=function(newPackName,isPackAs){
  if(isPackAs==undefined){isPackAs=false;}
  //if there is a package name given
  if(newPackName!=undefined){
    //if the package name is not index
    if(newPackName!=='index'){
      console.log('packing current project...');
      //if create this package as (like save as)
      if(isPackAs){

      }else{
        //rename this package if has already been packed...

        //if a current dist/index.html file is already there (current unpacked project)
        if(fs.existsSync('./dist/index.html')){
          //get the html of the current unpacked project (this one)
          var thisHtml=fs.readFileSync('./dist/index.html', 'utf8');
          //get the project json of this project
          var thisProjJson=getProjectFilesJson(thisHtml);
          if(thisProjJson!=undefined){
            //if this project is named
            if(thisProjJson.hasOwnProperty('name')){
              //if this newPackName is different from the previous, thisProjJson.name (if renaming package)
              if(thisProjJson.name!==newPackName){
                //if this previous package name exists
                if(fs.existsSync('./dist/'+thisProjJson.name+'.html')){
                  //delete previous package file
                  console.log('DISCARD PACKAGE NAME --> '+thisProjJson.name+'.html');
                  fs.unlinkSync('./dist/'+thisProjJson.name+'.html');
                }
              }
            }
          }
        }
      }
      //set the package name (written into the .html file)
      setNewProjName=newPackName;
      //for each compile task
      for(var c=0;c<htmlReloadTasks.length;c++){
        var taskName=htmlReloadTasks[c];
        console.log('[pack-task] '+taskName);
        //run compile task
        htmlReloadFunctions[taskName]();
      }
      //if this package name already exists
      if(fs.existsSync('./dist/'+newPackName+'.html')){
        //delete the package so it can be recreated
        fs.unlinkSync('./dist/'+newPackName+'.html');
      }
      //get the the html from recompiled index.html file
      var compiledHtml=fs.readFileSync('./dist/index.html', 'utf8');
      //now write out the package (copy of index.html)
      fs.writeFileSync('./dist/'+newPackName+'.html', compiledHtml);
      console.log('PACKAGE CREATED --> '+newPackName+'.html');
    }else{
      console.log('"'+newPackName+'" is reserved for the current unpacked project. Please choose a different package name.');
    }
  }else{
    console.log('Please choose a package name. This is the name of the .html file of the package. Example:');
    console.log('\tgulp pack --{name-of-your-html-file} \n');
  }
};
//gulp task to package a project into a compiled .html file (save-as)
gulp.task('packas', function(){
  //if package name provided
  var newPackName=getYargKey(argv);
  if(newPackName!=undefined){
    //do pack
    gulpPack(newPackName,true);
  }else{
    console.log('Please choose a package name. This is the name of the .html file of the package. Example:');
    console.log('\tgulp packas --{name-of-your-html-file} \n');
  }
});
//gulp task to package a project into a compiled .html file (save)
gulp.task('pack', function(){
  //if package name provided
  var newPackName=getYargKey(argv);
  if(newPackName==undefined){
    //if a current dist/index.html file is already there (current unpacked project)
    if(fs.existsSync('./dist/index.html')){
      //get the html of the current unpacked project (this one)
      var thisHtml=fs.readFileSync('./dist/index.html', 'utf8');
      //get the project json of this project
      var thisProjJson=getProjectFilesJson(thisHtml);
      if(thisProjJson!=undefined){
        //if this project is named
        if(thisProjJson.hasOwnProperty('name')){
          //just use the name of the CURRENT package
          newPackName=thisProjJson.name;
          console.log('current package, "'+newPackName+'"');
        }
      }
    }
  }
  //if there is a package name to pack
  if(newPackName!=undefined){
    //do pack
    gulpPack(newPackName);
  }else{
    console.log('Please choose a package name. This is the name of the .html file of the package. Example:');
    console.log('\tgulp pack --{name-of-your-html-file} \n');
  }
});
gulp.task('packstat', function(){
  var hasStat=false;
  //if package name provided
  var packName=getYargKey(argv);
  if(packName==undefined){
    //if a current dist/index.html file is already there (current unpacked project)
    if(fs.existsSync('./dist/index.html')){
      //get the html of the current unpacked project (this one)
      var thisHtml=fs.readFileSync('./dist/index.html', 'utf8');
      //get the project json of this project
      var thisProjJson=getProjectFilesJson(thisHtml);
      if(thisProjJson!=undefined){
        console.log('Current package: ');
        hasStat=true;
        for(key in thisProjJson){
          if(thisProjJson.hasOwnProperty(key)){
            console.log(key+' --> '+thisProjJson[key]);
          }
        }
      }
    }
  }
  if(!hasStat){
    console.log('No package is open.');
    console.log('gulp pack');
    console.log('gulp pack --{name-of-your-html-file}');
    console.log('...to update/create package. If no --html-file name is provided, just update the CURRENT package');
  }
});
//pass the name of an html file, this task will read the project files and
//try to separate out the project files into different "unpacked" files
gulp.task('unpack', function(){
  var saveThisFirst=false; var alreadyUnpacked=false; var clearProjJson;
  //get the name of the project to unpack
  var fileName=getYargKey(argv);
  //if a package name was given
  if(fileName!=undefined){
    //if the package name is not index
    if(fileName!=='index'){
      //if a current dist/index.html file is already there (current unpacked project)
      if(fs.existsSync('./dist/index.html')){
        //flag: pack current project BEFORE unpacking another
        saveThisFirst=true;
        //get the html of the current unpacked project (this one)
        var thisHtml=fs.readFileSync('./dist/index.html', 'utf8');
        //get the project json of this project
        var thisProjJson=getProjectFilesJson(thisHtml);
        if(thisProjJson!=undefined){
          //if this project is named
          if(thisProjJson.hasOwnProperty('name')){
            //compile/pack this current project into an updated {name}.html file...
            gulpPack(thisProjJson.name);
            //current project packed already; safe to unpack a different project now
            saveThisFirst=false;
            //if NOT trying to unpack the already unpacked project
            if(thisProjJson.name!==fileName){
              //get the (possibly) updated project files list from {name}.html
              thisHtml=fs.readFileSync('./dist/'+thisProjJson.name+'.html', 'utf8');
              clearProjJson=getProjectFilesJson(thisHtml);
            }else{
              alreadyUnpacked=true;
            }
          }
        }
      }
      //if the current project is not already packed (needs save-as before unpacking a new project)
      if(!saveThisFirst){
        //if this project is NOT already unpacked
        if(!alreadyUnpacked){
          //if the package to unpack exists
          var path='./dist/'+fileName+'.html';
          if (fs.existsSync(path)){
            //if the project files json could be found in this html
            var html=fs.readFileSync(path, 'utf8');
            var projJson=getProjectFilesJson(html);
            if(projJson!=undefined){
              //if there are any project files
              if(projJson.files.length>0){
                //if there are existing package files that should be cleared before the new package files are unpacked
                if(clearProjJson!=undefined){
                  //for each file, from this packaged project
                  for(var p=0;p<clearProjJson.files.length;p++){
                    var ppath=clearProjJson.files[p];
                    if(ppath.indexOf('.')===0){
                      ppath=ppath.substring(1);
                    }
                    if(ppath.indexOf('/')===0){
                      ppath=ppath.substring(1);
                    }
                    //if this file exists
                    if(fs.existsSync('./'+ppath)){
                      //remove this file so that the new package files can replace this previous package's files
                      fs.unlinkSync('./'+ppath);
                    }
                  }
                }
                //init the new template.html
                var newTemplateHtml=html;
                //for each project file
                for(var f=0;f<projJson.files.length;f++){
                  //get the file path
                  var fpath=projJson.files[f];
                  //get just the file name
                  var fname=fpath;
                  if(fname.lastIndexOf('/')!==0){
                    fname=fname.substring(fname.lastIndexOf('/')+'/'.length);
                  }
                  //get the file content, embedded as part of the html
                  var contentParts=getSplitContent(html,fname);
                  //if this file has embedded content
                  if(contentParts!=undefined){
                    console.log('[unpack] '+fpath);
                    if(fpath.indexOf('.')===0){
                      fpath=fpath.substring(1);
                    }
                    if(fpath.indexOf('/')===0){
                      fpath=fpath.substring(1);
                    }
                    //if a file with this name already exists
                    if(fs.existsSync('./'+fpath)){
                      //delete this file
                      fs.unlinkSync('./'+fpath);
                    }
                    //create this project file (unpack it)
                    fs.writeFileSync('./'+fpath, contentParts[1]);
                    //remove the embeded content from the template.html string
                    var templateParts=getSplitContent(newTemplateHtml,fname);
                    if(templateParts!=undefined){
                      //remove this file content from the new template.html
                      newTemplateHtml=templateParts[0]+templateParts[2];
                    }
                  }else{
                    console.log('\n"'+fpath+'" is named within the project files, but doesn\'t appear within the '+fileName+'.html\n');
                  }
                }
                //copy the {package}.html to dist/index.html
                //if dist/index.html already exists
                if(fs.existsSync('./dist/index.html')){
                  //delete this file
                  fs.unlinkSync('./dist/index.html');
                }
                //copy the {package}.html to dist/index.html
                fs.writeFileSync('./dist/index.html', html);
                //remove <!-- [@project] ... [/@project] --> from newTemplateHtml
                newTemplateHtml=removeProjectFilesJson(newTemplateHtml);
                //if template.html already exists
                if(fs.existsSync('template.html')){
                  //delete this file
                  fs.unlinkSync('template.html');
                }
                //copy the {package}.html to dist/index.html
                fs.writeFileSync('template.html', newTemplateHtml);
                //open the unpacked project into a browser
                gulpServe();
              }
            }else{
              console.log('\nProject tags not found in '+path+': '+startProjFiles.trim()+' ... '+endProjFiles.trim()+'\n');
            }
          }else{
            console.log('\nDoesn\'t exist: "'+path+'"\n');
          }
        }else{
          console.log('\n"'+fileName+'" is already unpacked.\n');
        }
      }else{
        //current file not saved/packed... must pack this before unpacking another...
        console.log('\nYour current project is not saved/packed. Please pack BEFORE unpacking a different project: \n');
        console.log('\tgulp pack --{name-of-your-html-file} \n');
        console.log('Give your current project a UNIQUE name, other than "index". It will be packaged into a single .html file. \n');
      }
    }else{
      console.log('"'+fileName+'" is an invalid package name since it is reserved for the CURRENT unpacked project.');
    }
  }else{
    console.log('\nYou must indicate which project you want to unpack. Example: ');
    console.log('gulp unpack --{name-of-your-html-file}\n');
  }
});
gulp.task('help', function(){
  console.log('Create a new package for the current index.html file and resources (like save-as):');
  console.log('\tgulp packas --{name-of-your-html-file}');
  console.log('Create, update or rename package (like save):');
  console.log('\tgulp pack --{rename-your-html-file}');
  console.log('\tgulp pack');
  console.log('Sitch to a different package to unpack and work on');
  console.log('\tgulp unpack --{name-of-your-html-file}');
  console.log('Check which package is currently unpacked:');
  console.log('\tgulp packstat');
});
//the default action will open a browser window for the index.html file
gulp.task('default', ['serve']);
