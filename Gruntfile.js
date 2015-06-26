module.exports = function (grunt) {
	'use strict';

	// Load in grunt tasks
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jscs');
	grunt.loadNpmTasks('grunt-lintspaces');

	grunt.initConfig({
		jshint: {
			all: ['*.js', 'app/js/*.js'],
			jshintrc: '.jshintrc'
		},
		jscs: {
			all: '<%= jshint.all %>',
			options: {
				config: '.jscsrc'
			}
		},
		lintspaces: {
			src: [
				'*', 'app/**/*',
				'!**/*.png', // Exclude images to prevent odd errors
				'!README.md' // Exclude README due to CLI indentation
			],
			options: {
				editorconfig: '.editorconfig'
			}
		}
	});

	grunt.registerTask('lint', ['jshint', 'jscs', 'lintspaces']);
};
