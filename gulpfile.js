const gulp = require('gulp');
const sass = require('sass');
const gulpSass = require('gulp-sass')(sass);
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const esbuild = require('esbuild');
const path = require('path');
const glob = require('glob');

const IGNORE = ['!src/scss/**/_*.scss'];

// ── CSS ──────────────────────────────────────────────
function buildCSS() {
    return gulp.src(['src/scss/**/*.scss', ...IGNORE])
        .pipe(gulpSass({ api: 'modern' }).on('error', gulpSass.logError))
        .pipe(gulp.dest('dist/css'));
}

function buildCSSMin() {
    return gulp.src(['src/scss/**/*.scss', ...IGNORE])
        .pipe(gulpSass({ api: 'modern' }).on('error', gulpSass.logError))
        .pipe(cleanCSS())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/css'));
}

// ── JS individuel ────────────────────────────────────
async function buildJS() {
    const files = glob.sync('src/js/**/*.js');

    await Promise.all(files.map(file => {
        const outfile = file.replace('src/js', 'dist/js');

        return esbuild.build({
            entryPoints: [file],
            outfile,
            bundle: false,
            format: 'esm',
        });
    }));
}

async function buildJSMin() {
    const files = glob.sync('src/js/**/*.js');

    await Promise.all(files.map(file => {
        const outfile = file
            .replace('src/js', 'dist/js')
            .replace('.js', '.min.js');

        return esbuild.build({
            entryPoints: [file],
            outfile,
            bundle: false,
            minify: true,
            format: 'esm',
        });
    }));
}

// ── JS bundle (app.js) ───────────────────────────────
async function buildJSBundle() {
    await esbuild.build({
        entryPoints: ['src/app.js'],
        outfile: 'dist/js/bundle.js',
        bundle: true,
        format: 'esm',
    });
}

async function buildJSBundleMin() {
    await esbuild.build({
        entryPoints: ['src/app.js'],
        outfile: 'dist/js/bundle.min.js',
        bundle: true,
        minify: true,
        format: 'esm',
    });
}

exports.build = gulp.parallel(
    buildCSS,
    buildCSSMin,
    buildJS,
    buildJSMin,
    buildJSBundle,
    buildJSBundleMin
);