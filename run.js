#!/usr/bin/env node
// Load in our dependencies
var spawn = require('child_process').spawn;

// Run our task and output stdout/stderr to parent
spawn(__dirname + '/./webkitbuilds/slack-for-linux/linux64/slack-for-linux', {stdio: [0, 1, 2]});
