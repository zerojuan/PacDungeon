var gulp = require( 'gulp' ),
  gutil = require( 'gulp-util' ),
  del = require( 'del' ),
  concat = require( 'gulp-concat' ),
  rename = require( 'gulp-rename' ),
  minifycss = require( 'gulp-minify-css' ),
  minifyhtml = require( 'gulp-minify-html' ),
  processhtml = require( 'gulp-processhtml' ),
  jshint = require( 'gulp-jshint' ),
  uglify = require( 'gulp-uglify' ),
  connect = require( 'gulp-connect' ),
  babel = require( 'gulp-babel' ),
  sourcemaps = require( 'gulp-sourcemaps' ),
  webpack = require( 'webpack' ),
  WebpackDevServer = require( 'webpack-dev-server' ),
  webpackConfig = require( './webpack.config.js' ),
  paths;

paths = {
  assets: 'src/assets/**/*',
  css:    'src/css/*.css',
  libs:   [
    'src/bower_components/phaser-official/build/phaser.min.js'
  ],
  js:     [ 'src/js/**/*.js' ],
  js6:    [ 'src/js6/**/*.js' ],
  dist:   './dist/'
};

gulp.task( 'clean', function( cb ) {
  del([ paths.dist ], cb );
});

gulp.task( 'copy-assets', [ 'clean' ], function() {
  gulp.src( paths.assets )
    .pipe( gulp.dest( paths.dist + 'assets' ) )
    .on( 'error', gutil.log );
});

gulp.task( 'copy-vendor', [ 'clean' ], function() {
  gulp.src( paths.libs )
    .pipe( gulp.dest( paths.dist ) )
    .on( 'error', gutil.log );
});

gulp.task( 'uglify', [ 'clean', 'lint' ], function() {
  gulp.src( paths.js )
    .pipe( concat( 'main.min.js' ) )
    .pipe( gulp.dest( paths.dist ) )
    .pipe( uglify({ outSourceMaps: false }) )
    .pipe( gulp.dest( paths.dist ) );
});

gulp.task( 'minifycss', [ 'clean' ], function() {
 gulp.src( paths.css )
    .pipe( minifycss({
      keepSpecialComments: false,
      removeEmpty: true
    }) )
    .pipe( rename({ suffix: '.min' }) )
    .pipe( gulp.dest( paths.dist ) )
    .on( 'error', gutil.log );
});

gulp.task( 'processhtml', [ 'clean' ], function() {
  gulp.src( 'src/index.html' )
    .pipe( processhtml({}) )
    .pipe( gulp.dest( paths.dist ) )
    .on( 'error', gutil.log );
});

gulp.task( 'minifyhtml', [ 'clean' ], function() {
  gulp.src( 'dist/index.html' )
    .pipe( minifyhtml() )
    .pipe( gulp.dest( paths.dist ) )
    .on( 'error', gutil.log );
});

gulp.task( 'lint', function() {
  gulp.src( paths.js )
    .pipe( jshint( '.jshintrc' ) )
    .pipe( jshint.reporter( 'default' ) )
    .on( 'error', gutil.log );
});

gulp.task( 'html', function() {
  gulp.src( 'src/*.html' )
    .pipe( connect.reload() )
    .on( 'error', gutil.log );
});

gulp.task( 'connect', function() {
  connect.server({
    root: [ __dirname + '/src' ],
    port: 9000,
    livereload: true
  });
});

gulp.task( 'watch', function() {
  gulp.watch([ paths.js ], [ 'lint' ]);
  gulp.watch([ './src/index.html', paths.css, paths.js ], [ 'html' ]);
});

gulp.task( 'webpack-dev-server', function( callback ) {
	// modify some webpack config options
	var myConfig = Object.create( webpackConfig );
	myConfig.devtool = 'eval';
	myConfig.debug = true;

	// Start a webpack-dev-server
	new WebpackDevServer( webpack( myConfig ), {
		publicPath: '/' + myConfig.output.publicPath,
		stats: {
			colors: true
		}
	}).listen(8080, 'localhost', function(err) {
		if(err) throw new gutil.PluginError('webpack-dev-server', err);
		gutil.log( '[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html' );
	});
});


// The development server (the recommended option for development)
gulp.task( 'default', [ 'webpack-dev-server' ]);
gulp.task( 'build', [ 'copy-assets', 'copy-vendor', 'uglify',
  'minifycss', 'processhtml', 'minifyhtml' ]);
