var gulp = require('gulp'),
    sequence = require('gulp-sequence'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    rev = require('gulp-rev'),
    revc = require('gulp-rev-collector'),
    babel = require('gulp-babel'),
    imagemin = require('gulp-imagemin'),
    merge = require('merge-stream')

//管理第三方插件管理
gulp.task('vendor',function () {
    return merge(
        gulp.src('./js/vendor/*.js')
            .pipe(gulp.dest('./src/js/vendor'))
    )
})
//压缩js并加min后缀
gulp.task('uglify',function () {
    return gulp.src('./js/*.js')
    // .pipe(rename({suffix:'.min'}))
    .pipe(babel({
        presets:['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./src/js'))
})

//给文件名加上MD5字符串
gulp.task('revjs',function () {
    // return gulp.src(['./src/js/index.min.js','./src/js/record.min.js'])
    return gulp.src('./src/js/*.js')
    .pipe(rev())
    .pipe(gulp.dest('./src/js'))
    .pipe(rev.manifest())//生成清单json
    .pipe(rename({ suffix: '.js' }))
    .pipe(gulp.dest('./src/rev'))
})

gulp.task('revcss', function () {
    return gulp.src(['./css/*.css'])
        .pipe(rev())
        .pipe(gulp.dest('./src/css'))
        .pipe(rev.manifest())//生成清单json
        .pipe(rename({ suffix: '.css' }))
        .pipe(gulp.dest('./src/rev'))
})



gulp.task('image', function () {
    gulp.src('./img/*')
        .pipe(imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
        }))
        .pipe(gulp.dest('./src/img'));//输出
});
//替换html中引用的文件名，和任务rev联合使用
gulp.task('revc',function () {
    return gulp.src(['./src/rev/*.json','./*.html'])//读取清单和html
    .pipe(revc({
        replaceReved:true //必加，模板中已经被替换的文件还能再被替换
    }))
    .pipe(gulp.dest('./src'))
})

//复制页面，改变html文件名，防止缓存
// gulp.task('revHtml',function () {
//     return gulp.src(['./src/rev/index.html','./src/rev/record.html'])
//     .pipe(rev())
//     .pipe(gulp.dest('./src'))
//     .pipe(rev.manifest())//生成清单json
//     .pipe(rename({suffix:'.html'}))
//     .pipe(gulp.dest('./src/rev'))
// })

//控制任务执行的顺序
// gulp.task('sequence', sequence('vendor','uglify', 'revjs', 'revcss','image','revc','revHtml'))
gulp.task('sequence', sequence('vendor','uglify', 'revjs', 'revcss','image','revc'))


// gulp.task('default', ['uglify', 'rev', 'revc', 'revHtml'])
// gulp.task('default', ['uglify', 'rev', 'revc'])
//监控
gulp.task('watch', function () {
    gulp.watch(['./css/minichat.css', './skin/h5chat/css/app.css', './js/minichat.js', './skin/h5chat/js/app.js', './h5chat.html'], function (event) {
        sequence('uglify', 'rev', 'revc', 'revHtml')(function (err) {
            if (err) console.log(err)
        })
    })
});   