(function () {
	'use strict';
	// Load in our dependencies
	var gui = nw.gui;
	var pkg = nw.require('../../package.json');

	// Define an AppMenu factory on window
	window.AppMenu = {
		// When requested to bind an app menu to a window
		bindTo: function (win) {
			// Generate our menu
			// Menus are inspired by
			// https://github.com/atom/electron-starter/blob/96f6117b4c1f33c0881d504d655467fc049db433/menus/linux.cson
			var menu = new gui.Menu({
				type: 'menubar'
			});

			// Add File menu dropdown
			var fileSubmenu = new gui.Menu();
			fileSubmenu.append(new gui.MenuItem({
				label: 'Quit - Ctrl+Q',
				click: window.plaidchat.exit,
				key: 'q', // ctrl+q to quit
				modifiers: 'ctrl'
			}));
			menu.append(new gui.MenuItem({
				label: 'File',
				submenu: fileSubmenu
			}));

			// Add View menu dropdown
			var viewSubmenu = new gui.Menu();
			viewSubmenu.append(new gui.MenuItem({
				label: 'Reload - Ctrl+R',
				click: window.plaidchat.reload,
				key: 'r', // ctrl+r to reload
				modifiers: 'ctrl'
			}));
			var developerSubsubmenu = new gui.Menu();
			developerSubsubmenu.append(new gui.MenuItem({
				label: 'Toggle Developer Tools - Ctrl+Shift+I',
				click: window.plaidchat.toggleDevTools,
				key: 'i', // ctrl++shift+i to open dev tools
				modifiers: 'ctrl-shift'
			}));
			viewSubmenu.append(new gui.MenuItem({
				label: 'Developer',
				submenu: developerSubsubmenu
			}));
			menu.append(new gui.MenuItem({
				label: 'View',
				submenu: viewSubmenu
			}));

			// Add Help menu dropdown
			var helpSubmenu = new gui.Menu();
			helpSubmenu.append(new gui.MenuItem({
				label: 'About plaidchat',
				click: window.plaidchat.openAboutWindow
			}));
			menu.append(new gui.MenuItem({
				label: 'Help',
				submenu: helpSubmenu
			}));

			// Bind the menu to the window
			win.menu = menu;
		}
	};
}());
