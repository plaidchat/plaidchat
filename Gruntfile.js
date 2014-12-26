module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-node-webkit-builder');

  grunt.initConfig({
    nodewebkit: {
      options: {
          platforms: ['linux64'],
          buildDir: './webkitbuilds', // Where the build version of my node-webkit app is saved
      },
      src: ['./app/**/*'] // Your node-webkit app
    },
  });
};
