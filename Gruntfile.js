module.exports = function (grunt) {
	'use strict';

	// Load in grunt tasks with optional development tasks
	grunt.loadNpmTasks('grunt-node-webkit-builder');
	try {
		grunt.loadNpmTasks('grunt-contrib-jshint');
		grunt.loadNpmTasks('grunt-jscs');
		grunt.loadNpmTasks('grunt-lintspaces');
	} catch (err) {
	}

	grunt.initConfig({
		nodewebkit: {
			options: {
				platforms: ['linux64'],
				buildDir: './webkitbuilds' // Where the build version of my node-webkit app is saved
			},
			src: ['./app/**/*'] // Your node-webkit app
		},
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
			src: ['*', 'app/**/*', '!**/*.png', '!app/bower_components/**/*', '!app/node_modules/**/*'],
			options: {
				editorconfig: '.editorconfig'
			}
		}
	});

	grunt.registerTask('lint', ['jshint', 'jscs', 'lintspaces']);
};
