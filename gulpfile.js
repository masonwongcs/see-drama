const gulp = require("gulp");
const sass = require("gulp-sass");
const babel = require("gulp-babel");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const gutil = require("gulp-util");
const rename = require("gulp-rename");
const browserSync = require("browser-sync").create();
const plumber = require("gulp-plumber");
const nodemon = require("gulp-nodemon");

const browserify = require("browserify");
const babelify = require("babelify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");

const BROWSER_SYNC_RELOAD_DELAY = 500;

gulp.task(
  "default",
  ["sass", "scripts", "copyLibs", "nodemon"],
  () => {
    browserSync.init(null, {
      proxy: "http://localhost:4000",
      files: ["./dist/**/*.*"],
      port: 7000
    });
    gulp.watch("./*.html").on("change", browserSync.reload);
    gulp.watch("./app/scss/**/*.scss", ["sass"]);
    gulp.watch("./app/js/**/*.js", ["scripts"]);
  }
);

gulp.task("sass", () => {
  const plugins = [autoprefixer({ browsers: ["last 2 versions"] }), cssnano()];
  return gulp
    .src("./app/scss/**/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss(plugins))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./dist/css"))
    .pipe(browserSync.stream());
});

gulp.task("babel", () => {
  return gulp
    .src("./app/js/*.js")
    .pipe(
      plumber({
        errorHandler: onError
      })
    )
    .pipe(
      babel({
        presets: ['es2015']
      })
    )
    .pipe(gulp.dest("dist/js"));
});

gulp.task("scripts", function() {
    return browserify({
        debug: true,
        entries: './app/js/main.js'
    })
        .transform(babelify)
        .bundle()
        // .pipe(buffer())
        // .pipe(sourcemaps.init({ loadMaps: true }))
        // .pipe(sourcemaps.write("../maps"))
        .pipe(source("bundle.js"))
        .pipe(gulp.dest('./dist/js'));
  // gulp.src('./dist/js/bundle.js') // entry point
  //     .bundle()
  //
  //
  //
  //     .pipe(browserify())
  //     .transform(babelify)
  //     .bundle()
  //     .pipe(gulp.dest('./dist/js'))
});

// Public Files
gulp.task("copyLibs", () => {
  return gulp.src("./app/lib/*").pipe(gulp.dest("dist/lib"));
});

const onError = err => {
  gutil.beep();
  console.log(err);
};

gulp.task("nodemon", function(cb) {
  var started = false;
  return nodemon({
    script: "app.js"
  }).on("start", function() {
    // to avoid nodemon being started multiple times
    // thanks @matthisk
    if (!started) {
      cb();
      started = true;
    }
  });
  // .on('restart', function onRestart() {
  //   // reload connected browsers after a slight delay
  //   setTimeout(function reload() {
  //     browserSync.reload({
  //       stream: false
  //     });
  //   }, BROWSER_SYNC_RELOAD_DELAY);
  // });
});
