/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    // Autoprefixer
    autoprefixer: {
      browsers: ['last 10 ios version'],
      cascade: false,
      remove: false
    },

		// SVG Store
		svgstore: {
			files: {
				sourceDirs: 'app/icons',
				outputFile: '/assets/icons.svg'
			}
		},

		// Inline content
		inlineContent: {
			'svgSpritesheet': 'dist/assets/icons.svg'
		},
  });

	if (app.env === 'test') {
		app.import('bower_components/jquery-simulate/jquery.simulate.js');
	}

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  return app.toTree();
};
