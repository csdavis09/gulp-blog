
"use strict"

const site = {
  title: "She can code-it"
}

import gulp     from 'gulp'
import react    from 'gulp-react'
import babel    from 'gulp-babel'
import gulpLoadPlugins  from 'gulp-load-plugins'
import del      from 'del'
import fs       from 'fs'
import df       from 'dateformat'
import through2 from 'through2'
import bSync    from 'browser-sync'
const reload =   bSync.reload
const plugins = gulpLoadPlugins()

var summarize = function(string, marker) {
  return string.split(marker)[0]
}

var collectPosts = function() {
  var posts = []

  return through2.obj(function(file, enc, cb) {
    var post = file.page
    post.body = file.contents.toString()
    post.summary = summarize(file.contents.toString(), '<!--more-->')
    post.content = file.contents
    post.publishedOn = file.page.publishedOn
    post.formattedDate = df(Date.parse(post.publishedOn), "mmmm d, yyyy ")
    posts.push(post)
    this.push(file)
    cb()
  }, function(cb) {
    posts.sort(function(a, b) {
      return Date.parse(b.publishedOn) - Date.parse(a.publishedOn)
    })
    site.posts = posts
    cb()
  })
}

gulp.task("blog", function() {
  return gulp.src("src/posts/**/*.md")
            .pipe(plugins.frontMatter({property: "page", remove: true}))
            .pipe(plugins.data({site: site}))
            .pipe(plugins.markdown())
            .pipe(collectPosts())
            .pipe(plugins.wrap(function (data) {
              return fs.readFileSync('src/templates/post.html').toString()
            }, null, {engine: 'nunjucks'}))
            .pipe(plugins.htmlmin({collapseWhitespace: true}))
            .pipe(gulp.dest("dist/blog"))
            .pipe(reload({stream: true}))
})

gulp.task('pages', function() {
  return gulp.src("src/pages/**/*.html")
            .pipe(plugins.data({site: site}))
            .pipe(plugins.nunjucksRender({ path: ['src/templates']}))
            .pipe(plugins.htmlmin({collapseWhitespace: true}))
            .pipe(gulp.dest('dist'))
            .pipe(reload({stream: true}))
})

gulp.task('sass', function()  {
  return gulp.src("src/css/**/*.scss")
            .pipe(plugins.sass({outputStyle: 'compact'}).on('error', plugins.sass.logError))
            .pipe(plugins.concat('css/all.min.css', {newLine: ''}))
            .pipe(gulp.dest('dist'))
            .pipe(reload({stream: true}))
})

gulp.task("images", function() {
  return gulp.src("src/img/**/*")
              .pipe(plugins.imagemin())
              .pipe(gulp.dest("dist/img"))
})

gulp.task("js", function() {
  return gulp.src("src/js/**/*.js")
              .pipe(gulp.dest("dist/js"))
})

gulp.task('deploy', function() {
  return gulp.src('dist/**/*')
              .pipe(plugins.ghPages())
})

gulp.task('watch', function(cb) {
  gulp.watch('src/js/**/*.js', ['js'])
  gulp.watch('src/css/**/*.scss', ['sass'])
  gulp.watch(['src/**/*.html'], ['pages'])
  gulp.watch(['src/posts/**/*'], ['blog'])
  gulp.watch('src/img/**/*', ['images'])
  cb()
})

gulp.task('assets', ['images', 'sass', 'js'])

gulp.task("clean", function() {
  del(['dist'])
})

gulp.task("sync", function() {
  return bSync({server: {baseDir: 'dist'}})
})

gulp.task("default", plugins.sequence('clean', 'assets', 'blog', 'pages', 'watch', 'sync') )


