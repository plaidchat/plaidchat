var pkg = require('./package.json');

module.exports = function (grunt) {
	'use strict';

	// Load in grunt tasks
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jscs');
	grunt.loadNpmTasks('grunt-lintspaces');
	grunt.loadNpmTasks('grunt-nw-builder');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.initConfig({
		jshint: {
			all: ['*.js', 'app/**/*.js', 'test/**/*.js'],
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
				'*', 'app/**/*', 'test/**/*',
				'!**/*.png', // Exclude images to prevent odd errors
				'!README.md' // Exclude README due to CLI indentation
			],
			options: {
				editorconfig: '.editorconfig'
			}
		},
		nwjs: {
			build: {
				options: {
					platforms: ['linux'],
					buildDir: './build',
					version: pkg.dependencies.nw.replace(/[^\d.]+/g, '')
				},
				src: [
					'./package.json',
					'./dist/**/*',
					'./app/**/*',
					'./node_modules/**/*',
					'!./node_modules/nw/**',
					'!./node_modules/grunt*/**',
					'!./node_modules/mocha/**',
					'!./node_modules/webdriver-manager/**',
					'!./node_modules/electron-prebuild/**',
					'!./node_modules/wd/**',
					'!./node_modules/chai/**'
				]
			}
		},
		copy: {
			build: {
				options: {
					mode: '0755'
				},
				files: [
					{
						src: './node_modules/electron-prebuilt/dist/libffmpegsumo.so',
						dest: './build/plaidchat/linux64/libffmpegsumo.so'
					},
					{
						src: './node_modules/electron-prebuilt/dist/libffmpegsumo.so',
						dest: './build/plaidchat/linux32/libffmpegsumo.so'
					}
				]
			}
		}
	});

	grunt.registerTask('lint', ['jshint', 'jscs', 'lintspaces']);
	grunt.registerTask('build', ['nwjs:build', 'copy:build']);
};
