var gulp = require('gulp')
var sass = require('gulp-sass')
var nodemon = require('gulp-nodemon')
var run = require('gulp-run')


// compile sass
gulp.task('sass', () => {
    return gulp.src('src/sass/*.sass')
        .pipe(sass())
        .pipe(gulp.dest('app/src/'));
});

// run server
gulp.task('run', () => {
    return run('/Users/james/mongodb/bin/mongod --dbpath=/Users/james/mongodb-data').exec()
})

// start all dev
gulp.task('start', () => {
    gulp.watch('src/sass/*.sass', gulp.series(['sass'])); // compile sass

    nodemon({
        script: 'src/server.js'
    })
})

