var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('concat-js', function() {
    return gulp.src(['js/common.js', 'js/attrs.js', 'js/model.js', 'js/view.js', 'js/draw.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
});