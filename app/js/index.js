/* global document */
/* global localStorage */
/* global window */
/* exported webslack */
window.webslack = (function (gui, urllib, pkg, localStorage) {
	'use strict';
	var LOCAL_STORAGE_KEY_CURRENT_DOMAIN = 'currentDomain';
	var SLACK_DOMAIN = 'slack.com';
	var SLACK_LOGIN_URL = 'https://slack.com/signin';
	var webslack = {};

	var win = gui.Window.get();
	var validSlackSubdomain = /(.+)\.slack.com/i;
	var validSlackRedirect = /(.+\.)?slack-redir.net/i;

	win.on('new-win-policy', function (frame, url, policy) {
		var openRequest = urllib.parse(url);

		if (validSlackRedirect.test(openRequest.host)) {
			gui.Shell.openExternal(url);
			policy.ignore();
			console.log('Allowing browser to handle: ' + JSON.stringify(openRequest));
		}
	});

	function newLocationToProcess(locationToProcess) {
		var locationHostname = urllib.parse(locationToProcess).hostname;

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

	function handleLoadIframe(url) {
		var bodyElement = document.body;

		// Remove all the body's children nodes
		while (bodyElement.firstChild) {
			bodyElement.removeChild(bodyElement.firstChild);
		}

		var iframeDomElement = document.createElement('iframe');

		iframeDomElement.setAttribute('src', url);
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
	return webslack;
})(require('nw.gui'), require('url'), require('../package.json'), localStorage);
