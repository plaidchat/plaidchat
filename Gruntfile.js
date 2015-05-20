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
			src: ['*', 'app/**/*', '!**/*.png'],
			options: {
				editorconfig: '.editorconfig'
			}
		}
	});

	grunt.registerTask('lint', ['jshint', 'jscs', 'lintspaces']);
};
