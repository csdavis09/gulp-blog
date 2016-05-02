var gulp     = require('gulp');
var nunjucksRender = require('gulp-nunjucks-render');
var markdown = require('gulp-markdown');
var htmlmin  = require('gulp-htmlmin');
var sequence  = require('gulp-sequence');
var del      = require('del');
var bSync    = require('browser-sync');
var reload    = bSync.reload;


gulp.task("blog", function() {
  return gulp.src("src/posts/**/*.md")
             .pipe(markdown())
             .pipe(htmlmin({collapseWhitespace: true}))
             .pipe(gulp.dest("dist/blog"))
             .pipe(reload({stream: true}));
});

gulp.task('pages', function() {
  return gulp.src("src/pages/**/*.html")
             .pipe(nunjucksRender({ path: ['src/templates']}))
             .pipe(gulp.dest('dist'))
             .pipe(reload({stream: true}));
});

gulp.task("clean", function() {
  del(['dist']);
});

gulp.task("sync", function() {
  return bSync({server: {baseDir: 'dist'}});
});

gulp.task("default", sequence('clean', 'blog','pages', 'sync') );
