
/*global document*/
/*global localStorage*/
/* exported webslack */
var webslack = (function(gui,urllib,pkg,localStorage) {
	'use strict';
	var LOCAL_STORAGE_KEY_CURRENT_DOMAIN = 'currentDomain';
	var webslack = {};

	var win = gui.Window.get();
	var validSlackSubdomain = /https?:\/\/(.+)\.slack.com(\/.*)?/i;
	var logoutSlackDomain   = /https?:\/\/slack.com(\/.*)?/i;
	var validSlackRedirect = /(.+\.)?slack-redir.com/i;
	var slackLoginUrl      = 'https://slack.com/signin';

	win.on('new-win-policy', function (frame, url, policy) {
		var openRequest = urllib.parse(url);

		if (validSlackRedirect.test(openRequest.host)) {
			gui.Shell.openExternal(url);
			policy.ignore();
			console.log('Allowing browser to handle: ' + JSON.stringify(openRequest));
		}
	});

    function newLocationToProcess(msg)
    {
     	if ( validSlackSubdomain.test(msg) ) {
     		var subdomain = validSlackSubdomain.exec(msg);
     		if ( subdomain[1] && subdomain[1].length > 1 ) {
     			var subdomainFiltered = subdomain[1];

     			if ( subdomainFiltered !== localStorage.getItem( LOCAL_STORAGE_KEY_CURRENT_DOMAIN ) ) {
     				localStorage.setItem( LOCAL_STORAGE_KEY_CURRENT_DOMAIN, subdomainFiltered );
     			}
     		}
     	} else if ( logoutSlackDomain.test(msg) ) {
     		localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_DOMAIN);
     	}
    }

    function handleLoadIframe( url ) {
    	var bodyElement = document.body;

    	while (bodyElement.firstChild) {
		    bodyElement.removeChild(bodyElement.firstChild);
		}

		var iframeDomElement = document.createElement('iframe');

		iframeDomElement.setAttribute('src', url );
		iframeDomElement.setAttribute('frameBorder','0');
		iframeDomElement.setAttribute('nwdisable','');
		iframeDomElement.setAttribute('nwfaketop','');

		bodyElement.appendChild(iframeDomElement);
    }

	win.on('document-end',function(frame) {
		if ( frame && frame.contentWindow ) {
			newLocationToProcess(frame.contentWindow.location.href);
		}
	});


	webslack.load = function() {
		if ( localStorage.getItem( LOCAL_STORAGE_KEY_CURRENT_DOMAIN ) ) {
			handleLoadIframe( 'https://' + localStorage.getItem( LOCAL_STORAGE_KEY_CURRENT_DOMAIN ) + '.slack.com/');	
		} else {
			handleLoadIframe(slackLoginUrl);
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
