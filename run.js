#!/usr/bin/env node
// Load in our dependencies
var spawn = require('child_process').spawn;

// Run our task and output stdout/stderr to parent
spawn('./node_modules/.bin/nw', ['.'], {cwd: __dirname, stdio: [0, 1, 2]});
