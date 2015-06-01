#!/usr/bin/env node
// Load in our dependencies
var spawn = require('child_process').spawn;

// Define `nw` to invoke on the current directory
var args = ['.'];

// Append all arguments after our node invocation
// e.g. `node run.js --version` -> `--version`
args = args.concat(process.argv.slice(2));

// Run our task and output stdout/stderr to parent
spawn('./node_modules/.bin/nw', args, {cwd: __dirname, stdio: [0, 1, 2]});
