/**
 * Created by hanqilin on 17/11/05.
 *
 */

var condition = true; //开发控制
// 引入 gulp及组件
var gulp = require('gulp'),                 //基础库
    imagemin = require('gulp-imagemin'),       //图片压缩
    uglify = require('gulp-uglify'),          //js压缩
    clean = require('gulp-clean'),             //清空文件夹
    runSequence = require('run-sequence'),      //执行序列
    gulpif = require('gulp-if'),                   //判断
    sass = require("gulp-sass"),                //sass 编译
    cssmin = require('gulp-minify-css'),        // css压缩
    concat = require('gulp-concat'),            // 合并文件
    autoprefixer = require('gulp-autoprefixer'),   //css 兼容
    htmlmin = require('gulp-htmlmin'),      //压缩html
    // 版本控制 参考资料
    // http://www.jianshu.com/p/df593ad8082d
    rev = require('gulp-rev'),                   //版本控制
    revCollector = require('gulp-rev-collector'), //版本控制
    babel = require("gulp-babel"),//es6 to es5
    //暂时这里有问题  所有的js 没有按照commonJS规范去实现。 所以不能用
    browserify = require('gulp-browserify'),// cmd 规范转 浏览器
    rename = require('gulp-rename'),//重命名ck
    cheerio = require('gulp-cheerio');// dom 操作 类似jquery
// sass样式处理
//CSS生成文件hash编码并生成 rev-manifest.json文件名对照映射


// 生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task('rev', function () {

    return gulp.src(['./dist/**/*.css', './dist/**/*.js'])
        .pipe(rev())
        .pipe(gulp.dest('./dist/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./dist/'))
});

gulp.task('css', function () {

    var cssSrc = './src/css/**/*.scss',
        cssDst = './dist/css';
    return gulp.src(cssSrc)
    // 暂时不合并
    //     .pipe(concat('all.scss'))//合并后的文件名
        .pipe(sass())  //处理sass
        .pipe(autoprefixer(
            {browsers: ['last 15 versions']}
        )) //兼容
        .pipe(gulpif(
            condition, cssmin()//压缩
        ))
        .pipe(gulp.dest(cssDst))
});

//js 压缩
gulp.task('js', function () {


    // pc 打包js
    gulp.src([
        './src/lib/vue/vue.js',
        './src/lib/vue/vue-resource.js',
        './src/lib/store/web-storage-cache.min.js',
        './src/js/views/base.js',
        './src/js/p/p.js'])
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js/p'));

    gulp.src([
        './src/lib/vue/vue.js',
        './src/lib/vue/vue-resource.js',
        './src/lib/fastclick/fastclick.js',
        './src/lib/store/web-storage-cache.min.js',
        './src/js/views/base.js'])
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js/views'));

    var jsUrl = ['./src/js/**/*.js'];
    return gulp.src(jsUrl)
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulpif(
            condition, uglify()
        ))
        .pipe(gulp.dest('./dist/js/'))

});


// html 添加版本号
gulp.task('revHtml', function () {
    // pc
    gulp.src(['./dist/**/*.json', './src/p/*.html'])
        .pipe(gulpif(
            condition, htmlmin({collapseWhitespace: true})
        ))
        .pipe(cheerio({
            run: function ($, file) {
                $('script[src*="../lib/vue/vue.js"]').remove();
                $('script[src*="../lib/vue/vue-resource.js"]').remove();
                $('script[src*="../lib/store/web-storage-cache.min.js"]').remove();
                $('script[src*="../js/views/base.js"]').remove();
                $('script[src*="../js/p/p.js"]').remove();
                $('#injected-js').after('<script  src="../js/p/all.js">')
                $('#injected-js').remove();

            },
            parserOptions: {
                // Options here
                decodeEntities: false
            }
        }))
        .pipe(revCollector())
        .pipe(gulp.dest('./dist/p'));

    return gulp.src(['./dist/**/*.json', './src/views/*.html'])  /*WEB-INF/views是本地html文件的路径，可自行配置*/
        .pipe(gulpif(
            condition, htmlmin({collapseWhitespace: true})
        ))
        .pipe(cheerio({
            run: function ($, file) {

                // $('link[href*="../css/"]').remove();
                // $('head').append('<link rel="stylesheet" href="../css/all.css">');
                $('script[src*="../lib/vue/vue.js"]').remove();
                $('script[src*="../lib/vue/vue-resource.js"]').remove();
                $('script[src*="../lib/fastclick/fastclick.js"]').remove();
                $('script[src*="../lib/store/web-storage-cache.min.js"]').remove();
                $('script[src*="../js/views/base.js"]').remove();


                $('#injected-js').after('<script  src="../js/views/all.js">')
                $('#injected-js').remove();

            },
            parserOptions: {
                // Options here
                decodeEntities: false
            }
        }))
        .pipe(revCollector())
        .pipe(gulp.dest('./dist/views'));


    /*Html更换css、js文件版本,WEB-INF/views也是和本地html文件的路径一致*/
});
// 拷贝lib
gulp.task('lib', function () {

    var libSrc = './src/lib/**/*.*',
        libDst = './dist/lib';
    return gulp.src(libSrc)
        .pipe(gulp.dest(libDst))
})

// CommonJS 语法编译
gulp.task('CommonJS', function () {
    return gulp.src('./dist/js/CommonJS/*.js')
        .pipe(browserify())
        .pipe(gulp.dest('./dist/js/CommonJS'))
});

// 图片处理
gulp.task('images', function () {
    var imgSrc = './src/imgs/**/*.*',
        imgDst = './dist/imgs';
    return gulp.src(imgSrc)
        .pipe(imagemin())
        .pipe(gulp.dest(imgDst));
})

// 拷贝font
gulp.task('font', function () {
    var fontSrc = './src/fonts/**/*.*',
        fontDst = './dist/fonts';
    return gulp.src(fontSrc)
        .pipe(gulp.dest(fontDst));
})


// 清空图片、样式、js
gulp.task('clean', function () {
    return gulp.src(['./dist'], {read: false})
        .pipe(clean());
});

gulp.task('watch', function () {
    gulp.watch('./src/js/**/*.js', ['revJs', 'CommonJS']);
});
//开发构建
gulp.task('dev', function (done) {
    runSequence(
        ['clean'],
        ['css'],
        ['js'],
        ['CommonJS'],
        ['images'],
        ['lib'],
        ['font'],
        ['rev'],
        ['revHtml'],
        done);
});
gulp.task('default', ['dev']);


// 版本控制 需要做的修改（必须）

// 版本控制 需要做的修改（必须）
/*
http://www.cnblogs.com/Q-zhangsan/p/6961762.html
 1.打开node_modules\gulp-rev\index.js
 第144行 manifest[originalFile] = revisionedFile;
 更新为: manifest[originalFile] = originalFile + '?v=' + file.revHash;
 2.打开nodemodules\gulp-rev\nodemodules\rev-path\index.js
 10行 return filename + '-' + hash + ext;
 更新为: return filename + ext;
 3.打开node_modules\gulp-rev-collector\index.js
最新
( 找到40行   let cleanReplacement =  path.basename(json[key]).replace(new RegExp( opts.revSuffix ), '' );
    修改为 let cleanReplacement =  path.basename(json[key]).split('?')[0];
    )
    版本是1.1.1
 31行if ( !_.isString(json[key]) || path.basename(json[key]).replace(new RegExp( opts.revSuffix ), '' ) !== path.basename(key) ) {
 更新为: if ( !_.isString(json[key]) || path.basename(json[key]).split('?')[0] !== path.basename(key) ) {

 */


// require("gulp-remove-use-strict"); 这个是可以取消严格模式
