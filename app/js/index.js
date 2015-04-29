(function () {
	'use strict';
	var fs = require('fs');
	var gui = require('nw.gui');
	var url = require('url');
	var _ = require('underscore');
	var getUri = require('get-uri');
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

	var trayIcon = 'images/app-32.png';
	var tray = new gui.Tray({
		title: pkg.window.title,
		icon: trayIcon, // Relative to `package.json`
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

	// Generate badge-able favicon for notifications
	var trayIconImg = document.createElement('link');
	trayIconImg.href = '../' + trayIcon; // Relative to `index.html`
	var favicon = new window.Favico({
		element: trayIconImg,
		dataUrl: function (dataUrl) {
			// Generate a location to save the image
			var filepath = process.env.HOME + '/.slack-for-linux-tray.png';

			// Convert the image to a stream
			getUri(dataUrl, function handleData (err, dataStream) {
				// If there was an error, log it (nothing to do regarding the image)
				if (err) {
					console.error(err);
				}

				// Generate a new write stream to the file
				var iconFile = fs.createWriteStream(filepath);
				dataStream.pipe(iconFile);
				dataStream.on('error', console.error);
				iconFile.on('finish', function handleNewIcon () {
					tray.icon = filepath;
				});
			});
		}
	});

	// When we load a new page
	win.on('loaded', function handlePageLoaded () {
		// If this is a page with TS on it, then add listeners for unread change events
		// DEV: tinyspeck is Slack's company name, this is likely an in-house framework
		var $slackUi = document.querySelector('iframe');
		var TS = $slackUi.contentWindow && $slackUi.contentWindow.TS;
		if (TS && !$slackUi.contentWindow._slackForLinuxBoundListeners) {
			// http://viewsource.in/https://slack.global.ssl.fastly.net/31971/js/rollup-client_1420067921.js#L6413-6419
			// DEV: This is the same list that is used for growl notifications (`TS.ui.growls`)
			var _updateUnreadCount = function () {
				// http://viewsource.in/https://slack.global.ssl.fastly.net/31971/js/rollup-client_1420067921.js#L6497
				// TODO: Slack makes a distinction between highlights (e.g. @mentions) and normal messages (e.g. chat)
				//   we should consider doing that too. The variable for this is `TS.model.all_unread_highlights_cnt`.
				var unreadMsgs = TS.model.all_unread_cnt;
				if (unreadMsgs) {
					favicon.badge(unreadMsgs);
				} else {
					favicon.reset();
				}
			};
			var updateUnreadCount = _.debounce(_updateUnreadCount, 100);
			var sig;
			if (TS.channels) {
				sig = TS.channels.unread_changed_sig; if (sig) { sig.add(updateUnreadCount); }
				sig = TS.channels.unread_highlight_changed_sig; if (sig) { sig.add(updateUnreadCount); }
			}
			if (TS.groups) {
				sig = TS.groups.unread_changed_sig; if (sig) { sig.add(updateUnreadCount); }
				sig = TS.groups.unread_highlight_changed_sig; if (sig) { sig.add(updateUnreadCount); }
			}
			if (TS.ims) {
				sig = TS.ims.unread_changed_sig; if (sig) { sig.add(updateUnreadCount); }
				sig = TS.ims.unread_highlight_changed_sig; if (sig) { sig.add(updateUnreadCount); }
			}
			if (TS.client) {
				sig = TS.client.login_sig; if (sig) { sig.add(updateUnreadCount); }
			}
			$slackUi.contentWindow._slackForLinuxBoundListeners = true;
		}
	});

	window.webslack = webslack;
})();
