const gulp = require('gulp');
const sass = require('sass');
const gulpSass = require('gulp-sass')(sass);
const rename = require('gulp-rename');
const esbuild = require('esbuild');

// Les partiels (_*.scss) ne contiennent que des variables Sass : ils ne produisent pas de fichier CSS
const SCSS = ['src/scss/**/*.scss', '!src/scss/**/_*.scss'];

// Tous les composants en un fichier, le seul JS publié : src/ts/bundle.ts → dist/js/bundle.js
const BUNDLE = 'src/ts/bundle.ts';

// ── CSS ──────────────────────────────────────────────
function buildCSS() {
    return gulp.src(SCSS)
        .pipe(gulpSass({ api: 'modern' }).on('error', gulpSass.logError))
        .pipe(gulp.dest('dist/css'));
}

// Minifié par Sass (compressed) et non par clean-css : clean-css ne connaît pas @starting-style ni @layer,
// il cassait l'animation et le fond du dialog, et l'ordre des styles des tableaux
function buildCSSMin() {
    return gulp.src(SCSS)
        .pipe(gulpSass({ api: 'modern', style: 'compressed' }).on('error', gulpSass.logError))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/css'));
}

// ── JS bundle ────────────────────────────────────────
// bundle: true : les composants importés par bundle.ts, et les modules qu'ils importent, dans le même fichier
function buildJSBundle() {
    return esbuild.build({
        entryPoints: [BUNDLE],
        outfile: 'dist/js/bundle.js',
        bundle: true,
        format: 'esm',
    });
}

function buildJSBundleMin() {
    return esbuild.build({
        entryPoints: [BUNDLE],
        outfile: 'dist/js/bundle.min.js',
        bundle: true,
        minify: true,
        format: 'esm',
    });
}

exports.build = gulp.parallel(
    buildCSS,
    buildCSSMin,
    buildJSBundle,
    buildJSBundleMin
);

// ── Watch ────────────────────────────────────────────
// Reconstruit dist/ à chaque modification de src/ : la doc (doc/) lit dist/ directement
function watchFiles() {
    gulp.watch('src/scss/**/*.scss', gulp.parallel(buildCSS, buildCSSMin));
    gulp.watch('src/ts/**/*.ts', gulp.parallel(buildJSBundle, buildJSBundleMin));
}

exports.watch = gulp.series(exports.build, watchFiles);
