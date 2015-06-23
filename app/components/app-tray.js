(function () {
	'use strict';
	// Load in our dependencies
	var assert = require('assert');
	var fs = require('fs');
	var gui = require('nw.gui');
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
			var unreadTotal = NotificationStore.getNotificationTotal();
			if (unreadTotal) {
				this._favicon.badge(unreadTotal);
			} else {
				this._favicon.reset();
			}
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
