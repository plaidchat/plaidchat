(function () {
	'use strict';
	// Load in our dependencies
	var require = nw.require;
	console.log(require('./package.json'));
	var assert = require('assert');
	var fs = require('fs');
	var gui = nw.gui;
	var getUri = require('get-uri');
	// DEV: Path relative to `index.html`
	var NotificationStore = require('../stores/notification');
	var pkg = require('../../package.json');

	// Define our constants
	var TRAY_ICON = 'images/app-32.png'; // Relative to `app/`
	var TRAY_ICON_HREF = '../' + TRAY_ICON; // Relative to `index.html`
	var DYNAMIC_TRAY_ICON_PATH = process.env.HOME + '/.plaidchat-tray.png';

	// Define a singleton AppTray element on window
	window.AppTray = {
		// When requested to start an app tray
		mount: function () {
			// Generate our static tray
			assert.strictEqual(this._tray, undefined, '`AppTray.mount()` was called but it has already been mounted.');
			var tray = this._tray = new gui.Tray({
				title: pkg.window.title,
				icon: TRAY_ICON, // Relative to `package.json`
				click: window.plaidchat.toggleVisibility
			});
			var trayMenu = new gui.Menu();
			trayMenu.append(new gui.MenuItem({
				label: 'Show/Hide window',
				click: window.plaidchat.toggleVisibility
			}));
			trayMenu.append(new gui.MenuItem({
				type: 'separator'
			}));
			trayMenu.append(new gui.MenuItem({
				label: 'Exit',
				click: window.plaidchat.exit
			}));
			tray.menu = trayMenu;

			// Generate badge-able favicon for notifications
			var trayIconImg = document.createElement('link');
			trayIconImg.href = TRAY_ICON_HREF;
			this._favicon = new window.Favico({
				element: trayIconImg,
				dataUrl: function (dataUrl) {
					// Convert the image to a stream
					getUri(dataUrl, function handleData (err, dataStream) {
						// If there was an error, log it (nothing to do regarding the image)
						if (err) {
							console.error(err);
						}

						// Generate a new write stream to the file
						var iconFile = fs.createWriteStream(DYNAMIC_TRAY_ICON_PATH);
						dataStream.pipe(iconFile);
						dataStream.on('error', console.error);
						iconFile.on('finish', function handleNewIcon () {
							tray.icon = DYNAMIC_TRAY_ICON_PATH;
						});
					});
				}
			});

			// Add a listener to handle notification changes
			var that = this;
			this._notificationListener = function () {
				that._handleNotificationUpdate();
			};
			NotificationStore.addChangeListener(this._notificationListener);
		},
		// When our notification count changes, update our badge with the total
		_handleNotificationUpdate: function () {
			// If nothing has changed since the last update, do nothing
			var notificationSummary = NotificationStore.getNotificationSummary();
			if (this._state) {
				var pastUnreadCount = this._state.unreadCount || 0;
				var nextUnreadCount = notificationSummary.unreadCount || 0;
				var pastUnreadHighlightCount = Math.min(this._state.unreadHighlightsCount || 0, 10);
				var nextUnreadHighlightCount = Math.min(notificationSummary.unreadHighlightsCount || 0, 10);
				var logInfo = {
					pastUnreadCount: pastUnreadCount,
					nextUnreadCount: nextUnreadCount,
					pastUnreadHighlightCount: pastUnreadHighlightCount,
					nextUnreadHighlightCount: nextUnreadHighlightCount
				};
				if (pastUnreadHighlightCount && pastUnreadHighlightCount === nextUnreadHighlightCount) {
					console.debug('[AppTray] Highlight notifications are active and have not changed. Not updating tray icon.', logInfo);
					return;
				} else if (pastUnreadCount === nextUnreadCount) {
					console.debug('[AppTray] Unread notifications have not changed. Not updating tray icon.', logInfo);
					return;
				} else {
					console.debug('[AppTray] Notification counts have changed. Allowing tray icon update to occur.', logInfo);
				}
			}

			// Update our badge
			// https://github.com/ejci/favico.js/blob/0.3.7/favico.js#L30
			console.debug('[AppTray] Updating tray icon with new notifications count', {
				unreadCount: notificationSummary.unreadCount,
				unreadHighlightsCount: notificationSummary.unreadHighlightsCount
			});
			if (notificationSummary.unreadHighlightsCount) {
				// Cap off our notification count at 9+ (like Slack)
				// http://viewsource.in/https://slack.global.ssl.fastly.net/31971/js/rollup-client_1420067921.js#L6496-6500
				var unreadHighlightsCount = notificationSummary.unreadHighlightsCount;
				if (notificationSummary.unreadHighlightsCount > 9) {
					unreadHighlightsCount = '9+';
				}
				this._favicon.badge(unreadHighlightsCount, {bgColor: '#D00'});
			} else if (notificationSummary.unreadCount) {
				// Display a bullet for unreads (like Slack)
				// http://viewsource.in/https://slack.global.ssl.fastly.net/31971/js/rollup-client_1420067921.js#L6496-6500
				// https://en.wikipedia.org/wiki/Bullet_%28typography%29
				this._favicon.badge('\u2022', {bgColor: '#666'});
			} else {
				this._favicon.reset();
			}

			// Save the new summary for comparison
			this._state = notificationSummary;
		},
		// When requested to remove our tray
		unmount: function () {
			// Unbind our tray
			this._tray.remove();
			delete this._tray;

			// Unbind our notification listener and favicon
			NotificationStore.removeChangeListener(this._notificationListener);
			delete this._notificationListener;
			delete this._favicon;
		}
	};
}());
