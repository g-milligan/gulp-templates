isProduction=false; //use minified js/css if isProduction=true

//===============================================


var gulp = require('gulp');
/*
note: to install additional required node plugins run command

  FORMAT:
    npm install gulp {plugin-name} --save-dev
  EXAMPLE:
    npm install gulp gulp-concat --save-dev

*/
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var rename = require('gulp-rename');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var sass = require('gulp-sass');
var minifycss = require('gulp-minify-css')

//minify and concat selected .js files --> also copy to distribution folder
gulp.task('join-crunch-js', function() {

  var joincrunch=gulp.src([
      'pretty_js/lib.js',
      'pretty_js/screen-mode.js',
      'pretty_js/main.js',
      'pretty_js/events.js',
      '!pretty_js/shaders.js'
    ])
    //join scripts into one file (excluding shaders.js) --> scripts.js
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('dist/js'))
    //minify the joined file --> scripts.min.js
    .pipe(rename('scripts.min.js'))
    .pipe(gulpif(isProduction, uglify()))
    .pipe(gulp.dest('dist/js'));

    return joincrunch;

});

/* Sass task */
gulp.task('compile-css', function () {
    gulp.src(['scss/*.scss'])
    .pipe(sass({
      includePaths: ['./scss/'],
      style:'expanded',
      sourceComments:'normal'
    }).on('error', gutil.log))
    .pipe(gulp.dest('dist/css'))
    .pipe(rename('styles.min.css'))
    .pipe(gulpif(isProduction, minifycss()))
    .pipe(gulp.dest('dist/css'))
    /* Reload the browser CSS after every change */
    .pipe(reload({stream:true}));
});

//prepend shaders.js to the minified script file
gulp.task('compile-js', ['join-crunch-js'], function(){
  return gulp.src(['pretty_js/shaders.js','dist/js/scripts.min.js'])
  .pipe(concat('scripts.min.js'))
  .pipe(gulp.dest('dist/js'));
});

gulp.task('html-reload', reload);
//for 'js-reload', do 'compile-js' then do browserSync.reload
gulp.task('js-reload', ['compile-js'], reload);

//for 'serve' do 'compile-js' then do everything in function()...
gulp.task('serve', ['compile-css', 'compile-js'], function() {
    //serve files from the root of this project distribution
    browserSync({
        server: {
            baseDir: "dist"
        }
    });
    //AUTO RELOAD: while the server runs...
    //do 'js-reload' whenever a change in .js files is detected
    gulp.watch("pretty_js/*.js", ['js-reload']);
    gulp.watch("scss/*.scss", ['compile-css']);
    gulp.watch("dist/*.html", ['html-reload']);
});

//the default action will open a browser window for the distribution index.html file
gulp.task('default', ['serve']);
