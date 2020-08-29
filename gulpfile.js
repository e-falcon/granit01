const {src, dest, series, parallel, watch, on} = require('gulp');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const notify = require('gulp-notify');
const include = require('gulp-include');
const autoprefixer = require('gulp-autoprefixer');

const browsersync = require('browser-sync').create();

const SOURCE_DIR = 'source';
const BUILD_DIR = 'build';
const RELEASE_DIR = 'release';
const INCLUDE_DIR = 'include';
const STYLES_DIR = 'styles';

const browserSyncReload = (cb) => {
   browsersync.reload();
   cb();
}



const html = () => (
   src([`./${SOURCE_DIR}/**/*.html`, `!**/${INCLUDE_DIR}/**/*.html`])
   .pipe(include())
   .pipe(dest(`./${BUILD_DIR}/`))
)
const htmlRelease = () => (
   src(`./${BUILD_DIR}/**/*.html`)
   .pipe(dest(`./${RELEASE_DIR}/`))
)

const watchHtml = () => (
   watch(`./${SOURCE_DIR}/**/*.html`)
      .on('change', series(html, parallel(htmlRelease, browserSyncReload)))
)

const styles = () => (
   src([`./${SOURCE_DIR}/${STYLES_DIR}/**/*.scss`, `!**/${INCLUDE_DIR}/**/*.scss`])
   .pipe(sass({
      outputStyle: 'expanded'
   }).on('error', sass.logError))
   .pipe(include())
      .on('error', sass.logError)
   .pipe(autoprefixer())
   .pipe(dest(`./${BUILD_DIR}/${STYLES_DIR}`))
   // .pipe(notify('Styles processed'))
)

const stylesRelease = () => (
   src(`./${BUILD_DIR}/${STYLES_DIR}/**/*.css`)
   .pipe(dest(`./${RELEASE_DIR}/${STYLES_DIR}`))
)

const browserSyncInit = (cb) => {
   browsersync.init({
      server: {
         baseDir: `./${BUILD_DIR}/`
      },
      port: 5000,
      notify: false
   });
   cb();
}

const watchCSS = () => {
   watch(`./${SOURCE_DIR}/${STYLES_DIR}/**/*.scss`)
   .on('change', series(styles, parallel(stylesRelease, () => (browsersync.stream({match: '**/*.css'})))));
}

exports.html = html;
exports.default = series(html, parallel(htmlRelease, browserSyncInit), watchHtml);
