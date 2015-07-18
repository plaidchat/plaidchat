(function () {
	'use strict';
	// Load in our dependencies
	var gui = require('nw.gui');
	var url = require('url');
	var program = require('commander');
	var AppMenu = window.AppMenu;
	var React = window.React;
	// DEV: Relative paths are resolved from `views/index.html`
	var SlackApplication = require('../components/slack-application');
	var pkg = require('../../package.json');

	// Define our constants
	var win = gui.Window.get();
	var SLACK_DOWNLOAD_HOSTNAME = 'files.slack.com';

	// If we are in a test environment, clear out localStorage
	if (process.env.NODE_ENV === 'test') {
		localStorage.clear();
	}

	// Interpet our CLI arguments
	// DEV: We need to coerce `nw.js'` arguments as `commander` expects normal (`['node', 'plaidchat', '--help']`)
	//   but `nw.js` only provides arguments themselves (e.g. `--help`)
	var argv = ['nw', pkg.name].concat(gui.App.argv);
	program
		.version(pkg.version)
		.option('--minimize-to-tray', 'When the tray icon is clicked, hide the window rather than minimize')
		// Allow unknown Chromium flags (used by integration tests)
		.allowUnknownOption()
		.parse(argv);

	win.on('new-win-policy', function (frame, urlStr, policy) {
		// Determine where the request is to
		var openRequest = url.parse(urlStr);

		// If the request is for a file, download it
		// DEV: Files can be found on `files.slack.com`
		//   https://files.slack.com/files-pri/{{id}}/download/tmp.txt
		if (openRequest.hostname === SLACK_DOWNLOAD_HOSTNAME) {
			policy.forceDownload();
			console.debug('Downloading file: ', urlStr);
			return;
		}

		// Otherwise, open the window via our browser
		// DEV: An example request is a redirect
		//   https://slack-redir.net/link?url=http%3A%2F%2Fgoogle.com%2F
		gui.Shell.openExternal(urlStr);
		policy.ignore();
		console.debug('Allowing browser to handle: ' + JSON.stringify(openRequest));
	});

	// Track minimization/hidden state
	// DEV: isHidden only changes programmatically; there are no events for it
	var isHidden = false;
	var isMinimized = false;
	win.on('minimize', function saveMinimization () {
		isMinimized = true;
	});
	win.on('restore', function saveRestoration () {
		isMinimized = false;
	});

	// Define a global set of controls for `plaidchat`
	var plaidchat = {
		// Method to exit our application
		exit: function () {
			console.debug('Exiting plaidchat...');
			process.exit();
		},
		// Method to reload our window
		reload: function () {
			win.reload();
		},
		// Method to start our application
		load: function () {
			// Bind our app menu to the window
			AppMenu.bindTo(win);

			// Setup initial team
			SlackApplication.loadInitialTeams();

			// Render our application
			var slackApp = React.createElement(SlackApplication, null);
			plaidchat.app = React.render(slackApp, document.body);
			console.debug('Starting application...');
		},
		openAboutWindow: function () {
			gui.Window.open('about.html', {
				height: 200,
				width: 400,
				toolbar: false
			});
		},
		// Method to open our dev tools (hooray development :tada:)
		toggleDevTools: function () {
			if (win.isDevToolsOpen()) {
				win.closeDevTools();
			} else {
				win.showDevTools();
			}
		},

		// Methods to toggle window visibility
		_showMinimize: function () {
			win.restore();
		},
		_toggleMinimize: function () {
			if (isMinimized) {
				plaidchat._showMinimize();
			} else {
				win.minimize(); // plaidchat._hideMinimize
			}
		},
		_showHidden: function () {
			win.show();
			isHidden = false;
		},
		_toggleHidden: function () {
			if (isMinimized || isHidden) {
				plaidchat._showHidden();
			} else {
				win.hide(); // plaidchat._hideHidden
				isHidden = true;
			}
		},
		showWindow: function () {
			if (program.minimizeToTray) {
				plaidchat._showHidden();
			} else {
				plaidchat._showMinimize();
			}
		},
		toggleVisibility: function () {
			if (program.minimizeToTray) {
				plaidchat._toggleHidden();
			} else {
				plaidchat._toggleMinimize();
			}
		}
	};

	// When `plaidchat` is run and we have an existing window, show the window
	// DEV: This only works when we have `single-instance: true` set
	gui.App.on('open', function handleOpen (cmdline) {
		plaidchat.showWindow();
	});

	// Expose plaidchat to other modules
	window.plaidchat = plaidchat;
})();
