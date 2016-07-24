var gulp = require('gulp');
var sass = require('gulp-sass');
var useref = require('gulp-useref');
var gulpIf = require('gulp-if');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var glob = require('glob');
var rename = require('gulp-rename');
var eventStream = require('event-stream');


gulp.task('default', function () {
	console.log('Gulp installed successfull.')
});


gulp.task('sass', function () {
	return gulp.src('app/src/assets/scss/**/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('app/src/assets/css'))
});

gulp.task('browserify', function (done){
    glob('app/src/assets/js/*-app.js', function(err, files) {
    	if (err) done(err);

    	files.forEach(function (file) {
    		var bundle = browserify([file]).bundle();
            bundle.pipe(source(file.slice(0, -3) + ".bundle.js"))
                  .pipe(gulp.dest(''));
    	});

        done();
    });

    /*glob('app/src/assets/js/*.page.js', function(err, files) {
        if(err) done(err);

        var tasks = files.map(function(entry) {
            return browserify({ entries: [entry] })
                .bundle()
                .pipe(source(entry))
                .pipe(rename({
                    extname: '.bundle.js'
                }))
                .pipe(gulp.dest(''));
            });
        eventStream.merge(tasks).on('end', done);
    })*/

});

gulp.task('watch', function () {
	gulp.watch('app/src/assets/scss/**/*.scss', ['sass']);
	gulp.watch('app/src/assets/js/**/*.js', ['browserify']);
});

gulp.task('css-js', ['sass', 'browserify'], function () {
	return gulp.src('app/src/**/*.ejs')
		.pipe(useref({searchPath: 'app/src'}))
		.pipe(gulpIf('*.js', uglify()))
		.pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest('app/dist'))
});

gulp.task('images', function () {
	return gulp.src('app/src/assets/img/**/*.+(png|jpg|gif|svg)')
		.pipe(cache(imagemin()))
		.pipe(gulp.dest('app/dist/assets/img'))
});

gulp.task('fonts', function () {
	return gulp.src('app/src/assets/fonts/**/*')
		.pipe(gulp.dest('app/dist/assets/fonts'))
});

//gulp.task('deploy', ['css-js', 'fonts', 'images']);
gulp.task('deploy', function (callback) {
	runSequence('clean-dist', ['css-js', 'fonts', 'images'] , callback)
});


gulp.task('clean-dist', function () {
	return del.sync('app/dist/**')
});

gulp.task('clean-cache', function (callback) {
	return cache.clearAll(callback)
});