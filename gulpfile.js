var site = {
  title: "She can code-it"
};

var gulp     = require('gulp');
var nunjucksRender = require('gulp-nunjucks-render');
var markdown = require('gulp-markdown');
var frontMatter = require('gulp-front-matter');
var htmlmin  = require('gulp-htmlmin');
var sass     = require('gulp-sass');
var sequence  = require('gulp-sequence');
var concat  = require('gulp-concat');
var data  = require('gulp-data');
var del      = require('del');
var through2      = require('through2');
var bSync    = require('browser-sync');
var reload    = bSync.reload;


var collectPosts = function() {
  var posts = [];

  return through2.obj(function(file, enc, cb) {
    var post = file.page;
    post.content = file.contents;
    posts.push(post);
    this.push(file);
    cb();
  }, function(cb) {
    site.posts = posts;
    cb();
  });
}

gulp.task("blog", function() {
  return gulp.src("src/posts/**/*.md")
             .pipe(frontMatter({property: "page", remove: true}))
             .pipe(data({site: site}))
             .pipe(markdown())
             .pipe(collectPosts())
             .pipe(htmlmin({collapseWhitespace: true}))
             .pipe(gulp.dest("dist/blog"))
             .pipe(reload({stream: true}));
});

gulp.task('pages', function() {
  return gulp.src("src/pages/**/*.html")
             .pipe(data({site: site}))
             .pipe(nunjucksRender({ path: ['src/templates']}))
             .pipe(htmlmin({collapseWhitespace: true}))
             .pipe(gulp.dest('dist'))
             .pipe(reload({stream: true}));
});

gulp.task('sass', function()  {
  return gulp.src("src/css/**/*.scss")
             .pipe(sass({outputStyle: 'compact'}).on('error', sass.logError))
             .pipe(concat('css/all.min.css', {newLine: ''}))
             .pipe(gulp.dest('dist'))
             .pipe(reload({stream: true}));
});

gulp.task("images", function() {
  return gulp.src("src/img/**/*")
             .pipe(gulp.dest("dist/img"));
});

gulp.task("clean", function() {
  del(['dist']);
});

gulp.task("sync", function() {
  return bSync({server: {baseDir: 'dist'}});
});

gulp.task("default", sequence('clean', 'images', 'sass', 'blog', 'pages', 'sync') );
