(function () {
	'use strict';
	var gui = require('nw.gui');
	var url = require('url');
	var pkg = require('../package.json');

	var LOCAL_STORAGE_KEY_CURRENT_DOMAIN = 'currentDomain';
	var SLACK_DOMAIN = 'slack.com';
	var SLACK_LOGIN_URL = 'https://slack.com/signin';
	var webslack = {};

	var win = gui.Window.get();
	var validSlackSubdomain = /(.+)\.slack.com/i;
	var slackDownloadHostname = 'files.slack.com';

	win.on('new-win-policy', function (frame, urlStr, policy) {
		// Determine where the request is to
		var openRequest = url.parse(urlStr);

		// If the request is for a file, download it
		// DEV: Files can be found on `files.slack.com`
		//   https://files.slack.com/files-pri/{{id}}/download/tmp.txt
		if (openRequest.hostname === slackDownloadHostname) {
			policy.forceDownload();
			console.log('Downloading file: ', urlStr);
			return;
		}

		// Otherwise, open the window via our browser
		// DEV: An example request is a redirect
		//   https://slack-redir.net/link?url=http%3A%2F%2Fgoogle.com%2F
		gui.Shell.openExternal(urlStr);
		policy.ignore();
		console.log('Allowing browser to handle: ' + JSON.stringify(openRequest));
	});

	function newLocationToProcess(locationToProcess) {
		var locationHostname = url.parse(locationToProcess).hostname;

		if (validSlackSubdomain.test(locationHostname)) {
			var subdomain = validSlackSubdomain.exec(locationHostname);
			if (subdomain[1] && subdomain[1].length > 1) {
				var subdomainFiltered = subdomain[1];

				if (subdomainFiltered !== localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_DOMAIN)) {
					localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_DOMAIN, subdomainFiltered);
				}
			}
		} else if (locationHostname === SLACK_DOMAIN) {
			localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_DOMAIN);
		}
	}

	function handleLoadIframe(urlStr) {
		var bodyElement = document.body;

		// Remove all the body's children nodes
		while (bodyElement.firstChild) {
			bodyElement.removeChild(bodyElement.firstChild);
		}

		var iframeDomElement = document.createElement('iframe');

		iframeDomElement.setAttribute('src', urlStr);
		iframeDomElement.setAttribute('frameBorder', '0');
		iframeDomElement.setAttribute('nwdisable', '');
		iframeDomElement.setAttribute('nwfaketop', '');

		bodyElement.appendChild(iframeDomElement);
	}

	win.on('document-start', function (frame) {
		if (frame && frame.contentWindow) {
			newLocationToProcess(frame.contentWindow.location.href);
		}
	});

	webslack.load = function () {
		if (localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_DOMAIN)) {
			handleLoadIframe('https://' + localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_DOMAIN) + '.slack.com/');
		} else {
			handleLoadIframe(SLACK_LOGIN_URL);
		}
	};

	var isMinimized = false;
	win.on('minimize', function () {
		isMinimized = true;
	});
	win.on('restore', function () {
		isMinimized = false;
	});
	function toggleVisibility() {
		if (isMinimized) {
			win.restore();
		} else {
			win.minimize();
		}
	}

	var tray = new gui.Tray({
		title: pkg.window.title,
		icon: pkg.window.icon,
		click: toggleVisibility
	});
	var trayMenu = new gui.Menu();
	trayMenu.append(new gui.MenuItem({
		label: 'Show/Hide window',
		click: toggleVisibility
	}));
	trayMenu.append(new gui.MenuItem({
		type: 'separator'
	}));
	trayMenu.append(new gui.MenuItem({
		label: 'Exit',
		click: function () {
			process.exit();
		}
	}));
	tray.menu = trayMenu;

	window.webslack = webslack;
})();
