var gulp     = require('gulp');
var markdown = require('gulp-markdown');
var htmlmin  = require('gulp-htmlmin');
var sequence  = require('gulp-sequence');
var del      = require('del');

gulp.task("blog", function() {
  return gulp.src("src/posts/**/*.md")
             .pipe(markdown())
             .pipe(htmlmin({collapseWhitespace: true}))
             .pipe(gulp.dest("dist/blog"));
});


gulp.task("clean", function() {
  del(['dist']);
});

gulp.task("default", sequence('clean', 'blog') );
