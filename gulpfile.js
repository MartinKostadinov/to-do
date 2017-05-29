
var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var prefix = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var minifyCss = require('gulp-clean-css');
var useref = require('gulp-useref');
var imagemin = require('gulp-imagemin');
var pump = require('pump');
var swPrecache = require('sw-precache');

//sass
gulp.task('sass', function () {
  return gulp
    .src('app/styles/scss/**/[^_]*?.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(prefix({
      browsers: ['last 5 versions', 'IE 7']
    }))
  //  .pipe(gulp.dest('dist/styles/css'))

    .pipe(gulp.dest('app/styles/css'))
    .pipe(browserSync.stream());
});

//imagemin
gulp.task('image', function(){
  return gulp.src('app/images/*')
  .pipe(imagemin())
  .pipe(gulp.dest('dist/images'));
});

//useref
gulp.task('useref', function(){
  return gulp.src('app/index.html')
  .pipe(useref())
  .pipe(gulpif('app/scripts/index.js', uglify()))
  .pipe(gulpif('app/styles/css/*.css', minifyCss()))
  .pipe(gulp.dest('dist'));
});

gulp.task('serve', function() {
  gulp.watch('app/styles/scss/*.scss', ['sass']);
    browserSync.init({
    server: 'app/',
    online: false,
    notify: false,
    files: ["app/**"],
    ghostMode: false
  });
  gulp.watch([
    'app/*.html',
    'app/scripts/*.js',
    'app/styles/css/main.css',
    '!./gulpfile.js'
  ], browserSync.reload);
});

gulp.task('default', ['serve']);

//uglify
// gulp.task('compress', function (cb) {
//   //  return  gulp.src('app/scripts/pagescripts/*.js')
//   //   .pipe(uglify())
//   //   .pipe(gulp.dest('app/scripts'));
//   pump([
//     gulp.src('dist/scripts/pagescripts/*.js'),
//     uglify(),
//     gulp.dest('dist/scripts')
//   ],
//   cb
//   );

// });
//watch and reload
// gulp.task('watch', ['sass', 'serve'], function () {
//     gulp.watch('app/styles/scss/*.scss', ['sass'], browserSync.reload());
//     gulp.watch('app/scripts/pagescripts/*.js', browserSync.reload);
//     gulp.watch('app/*.html', browserSync.reload);
//  // gulp.watch('dist',['compress']);
// });