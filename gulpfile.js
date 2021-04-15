'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();

sass.compiler = require('node-sass');

const config = {
	bSync:{
		files: ["./**/**/*.php"],
		reloadDelay: 200,
		proxy: "test-fonts-api.loc",
		open: false
	},
	scss:{
		src: './assets/css/'
	},
	js:{
		src: './assets/js/'
	},
	maps:{
		src: '../maps'
	}
}

function css() {
	return gulp.src(config.scss.src + 'scss/site.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'expanded',
			errLogToConsole: true
		}))
		.pipe(postcss([
			require('precss'),
			require('autoprefixer')
		]))
		.pipe(sourcemaps.write(config.maps.src))
		.pipe(gulp.dest(config.scss.src))
		.pipe(browserSync.stream());
}

function js() {
	return gulp.src([config.js.src + '*.js', '!' + config.js.src + '*.min.js'])
		.pipe(sourcemaps.init())
		.pipe(babel({
			// presets: ['@babel/preset-env'],
			presets: [
				["@babel/preset-env", {
					"targets": {
						"esmodules": true
					},
					modules: false
				}]
			],
			plugins: [
				/** Support for the experimental syntax 'classProperties' isn't currently enabled
				 * Add @babel/plugin-proposal-class-properties (https://git.io/vb4SL) to the 'plugins' section of your Babel config to enable transformation.
				 * */
				["@babel/plugin-proposal-class-properties"],
				
				/** If you want to leave it as-is, add @babel/plugin-syntax-class-properties (https://git.io/vb4yQ) to the 'plugins' section to enable parsing. */
				// ["@babel/plugin-syntax-class-properties"]
			]
		}))
		.pipe(terser())
		.pipe(rename({ extname: '.min.js' }))
		.pipe(sourcemaps.write(config.maps.src))
		.pipe(gulp.dest( config.js.src ))
		.pipe(browserSync.stream());
}

function jsModules() {
	return gulp.src([config.js.src + 'modules/*.js', '!' + config.js.src + 'modules/*.min.js'])
		.pipe(sourcemaps.init())
		.pipe(babel({
			presets: [
				["@babel/preset-env", {
					"targets": {
						"esmodules": true
					},
					modules: false
				}]
			]
		}))
		.pipe(terser())
		.pipe(rename({ extname: '.min.js' }))
		.pipe(sourcemaps.write(config.maps.src))
		.pipe(gulp.dest( config.js.src + 'modules/' ))
		.pipe(browserSync.stream());
}

function jsPolyfills() {
	return gulp.src([
		config.js.src + 'polyfills/indexeddb_databases-polyfill.js',
		config.js.src + 'polyfills/smoothscroll-polyfill@0.4.4.min.js'
	])
		.pipe(sourcemaps.init())
		.pipe(concat('polyfills.min.js'))
		.pipe(terser({
			compress:{
				defaults: false
			},
			output: {
				comments: /^!|^\s/,
			}
		}))
		.pipe(sourcemaps.write(config.maps.src))
		.pipe(gulp.dest(config.js.src));
}

exports.watch =  gulp.series([css, js, jsModules, jsPolyfills], function() {
	browserSync.init(config.bSync);
	gulp.watch(config.scss.src + 'scss/**/*.scss', gulp.series(css));
	gulp.watch(config.js.src + 'main.js', gulp.series(js));
	gulp.watch([config.js.src + 'modules/*.js', '!' + config.js.src + 'modules/*.min.js'], gulp.series(jsModules));
});