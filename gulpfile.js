/* global require */
const gulp = require('gulp');


// Start browserSync server
gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: 'app'
        }
        //browser: "google chrome canary"
    });
});


// SASS task for CSS
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
gulp.task('sass', function () {
    return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
        .pipe(sass().on('error', sass.logError)) // Passes it through a gulp-sass, log errors to console
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('app/css')) // Outputs it in the css folder
        .pipe(browserSync.stream()); // browserSync.stream for CSS
});


// Watchers
gulp.task('watch', function () {
    // Runs sass task whenever SCSS files change
    gulp.watch('app/scss/**/*.scss', ['sass']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/**/*.js', browserSync.reload);
    // Other watchers if necessary
})


// CSS Minification + Sourcemap
// If concatenation needed, add it before minification
const sourcemaps = require('gulp-sourcemaps');
const cssnano = require('gulp-cssnano');
gulp.task('minifyCSS', function () {
    return gulp.src('app/css/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(cssnano())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/css'));
});


// // ESlint task
// // Create configuration file: ./node_modules/.bin/eslint --init
const eslint = require('gulp-eslint');
gulp.task('lint', function () {
    return gulp.src('app/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});


// JS Minification + Sourcemap
// If concatenation needed, add it before minification
// const babel = require('gulp-babel');
// const babelcore = require('babel-core');
// const uglify = require('gulp-uglify');
const uglify = require('gulp-uglify-es').default;
gulp.task('minifyJS', function () {
    return gulp.src('app/js/**/*.js')
        .pipe(sourcemaps.init())
        // .pipe(babel({
        //     presets: ['env']
        // }))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
});


// HTML Minification
const htmlmin = require('gulp-htmlmin');
gulp.task('minifyHTML', function () {
    return gulp.src('app/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('dist'));
});


// Images copying
gulp.task('images', function () {
    return gulp.src('app/img/**/*.+(png|jpg|jpeg|gif|svg|webp)')
        .pipe(gulp.dest('dist/img'));
});


// Copy manifest, SW and the rest
gulp.task('service-worker', function () {
    return gulp.src(['app/*.+(json|js)', 'app/_redirects'])
        .pipe(gulp.dest('dist'));
});


// Rename static minified files
const rev = require('gulp-rev');
const revdel = require('gulp-rev-delete-original');
gulp.task('ver-append', function () {
    return gulp.src(['dist/**/*.html',
            'dist/**/*.css',
            'dist/**/*.js'
        ])
        .pipe(rev())
        .pipe(revdel())
        .pipe(gulp.dest('dist'))
        .pipe(rev.manifest('manifest-ver-append.json'))
        .pipe(gulp.dest('dist'));
});


// Rename them inside the files (update references)
const collect = require('gulp-rev-collector');
gulp.task('updateHTML', function () {
    return gulp.src(['dist/manifest-ver-append.json', 'dist/**/*.{html, json, css, js}'])
    // return gulp.src(['dist/manifest-ver-append.json', 'dist/sw.js}'])
        .pipe(collect())
        .pipe(gulp.dest('dist'));
});


// Cleaning up
const cache = require('gulp-cache');
const del = require('del');
gulp.task('clean:all', function () {
    return del.sync('dist').then(function (cb) {
        return cache.clearAll(cb);
    });
});
gulp.task('clean:dist', function () {
    return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});


// Combining all gulp tasks
// Creates a dist folder for the production site
const runSequence = require('run-sequence');
gulp.task('build', function (callback) {
    runSequence(
        'clean:dist',
        'sass',
        // 'lint',
        ['minifyCSS',
            'minifyJS',
            'minifyHTML'
        ],
        'images',
        'service-worker',
        // 'ver-append',
        // 'updateHTML',
        callback
    );
});


// Compiles Sass into CSS while watching HTML and JS files for changes
gulp.task('default', function (callback) {
    runSequence(['sass', 'browserSync'], 'watch',
        callback
    );
});


// Resources
// https://css-tricks.com/gulp-for-beginners/
// Web Tooling & Automation Udacity Course
// https://medium.com/@felipebernardes/solving-browser-cache-hell-with-gulp-rev-6349a293abb9