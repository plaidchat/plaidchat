#!/usr/bin/env node
var spawn = require('child_process').spawn;

//Set the process title
//So `killall node` doesn't kill slack-for-linux
process.title = 'slack-for-linux';

spawn(__dirname + '/./webkitbuilds/slack-for-linux/linux64/slack-for-linux');
