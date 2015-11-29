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
  webpackConfig = require( './webpack.config.js' );

gulp.task( 'webpack:build', function( callback ) {
	// modify some webpack config options
	var myConfig = Object.create( webpackConfig );
  console.log( myConfig );
  if ( !myConfig.plugins ) {
    myConfig.plugins = [];
  }
	myConfig.plugins = myConfig.plugins.concat(
		new webpack.DefinePlugin({
			'process.env': {
				// This has effect on the react lib size
				'NODE_ENV': JSON.stringify( 'production' )
			}
		}),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin()
	);

	// run webpack
	webpack( myConfig, function( err, stats ) {
		if ( err ) {
      throw new gutil.PluginError( 'webpack:build', err );
    }

    gutil.log( '[webpack:build]', stats.toString({
			colors: true
		}) );
		callback();
	});
});

gulp.task( 'webpack-dev-server', function( callback ) {
	// modify some webpack config options
	var myConfig = Object.create( webpackConfig );
  console.log( myConfig );
	myConfig.devtool = 'eval';
	myConfig.debug = true;

	// Start a webpack-dev-server
	new WebpackDevServer( webpack( myConfig ), {
		publicPath: '/' + myConfig.output.publicPath,
		stats: {
			colors: true
		}
	}).listen( 8080, 'localhost', function( err ) {
		if ( err ) {
      throw new gutil.PluginError( 'webpack-dev-server', err );
    }
		gutil.log( '[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html' );
	});
});


// The development server (the recommended option for development)
gulp.task( 'default', [ 'webpack-dev-server' ]);

// Production build
gulp.task( 'build', [ 'webpack:build' ]);
