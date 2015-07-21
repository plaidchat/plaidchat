// Load in dependencies
var assert = require('assert');
var functionToString = require('function-to-string');
var nw = require('nw');
var wd = require('wd');
var definePlaidchatHelpers = require('./plaidchat-helpers');

// Eagerly find our nw patch
var nwCmd = nw.findpath();

// Define helpers for interacting with the browser
exports.openPlaidchat = function (options) {
	// Fallback our options
	options = options || {};

	// Execute many async steps
	before(function startBrowser () {
		this.browser = wd.remote();
		// DEV: To debug selenium interactions
		//   Enable thes line
		// global.browser = this.browser;
		//    and run the following inside of a `node` repl
		// process.exit = function () {};
		// process.argv = ['node', '_mocha', '--timeout', '10000'];
		// require('mocha/bin/_mocha');
		//    when mocha is completed, access `browser` as a Selenium session
	});
	before(function openBrowser (done) {
		this.browser.init({
			browserName: 'chrome',
			chromeOptions: {
				binary: nwCmd
			}
		}, done);
	});
	before(function navigateToPlaidchat (done) {
		// /plaidchat/test/integration-tests/utils/../../../app/views/index.html
		var plaidchatUrl = 'file://' + __dirname + '/../../../app/views/index.html';
		this.browser.get(plaidchatUrl, done);
	});

	// Add common helpers
	exports.execute(definePlaidchatHelpers);

	// If we want to want to kill the session, clean it up
	// DEV: This is useful for inspecting state of a session
	var killBrowser = options.killBrowser === undefined ? true : options.killBrowser;
	if (killBrowser) {
		after(function killBrowserFn (done) {
			this.browser.quit(done);
		});
	}
	after(function cleanup () {
		delete this.browser;
	});
};

// Helper to assert we have a browser started always
exports.assertBrowser = function () {
	before(function assertBrowserFn () {
		assert(this.browser, '`this.browser` is not defined. Please make sure ' +
			'`browserUtils.openPlaidchat()` has been run.');
	});
};

exports.execute = function () {
	// Save arguments in an array
	var args = [].slice.call(arguments);

	// If the first argument is a function, coerce it to a string
	var evalFn = args[0];
	if (typeof evalFn === 'function') {
		args[0] = functionToString(evalFn).body;
	}

	// Run the mocha bindings
	exports.assertBrowser();
	before(function runExecute (done) {
		// Add on a callback to the arguments
		var that = this;
		args.push(function handleResult (err, result) {
			// Save the result and callback
			that.result = result;
			done(err);
		});

		// Execute our request
		this.browser.execute.apply(this.browser, args);
	});
	after(function cleanup () {
		delete this.result;
	});
};
