/*global window*/
var webslack = (function(gui,urllib,request,localStorage) {
	'use strict';

	var webslack = {};

	var win = gui.Window.get();
	var validSlackSubdomain = /https?:\/\/(.+\.)?slack.com(\/.*)?/i;
	var validSlackRedirect = /(.+\.)?slack-redir.com/i;

	win.on('new-win-policy',function (frame, url, policy) {
		var openRequest = urllib.parse(url);

		if ( validSlackRedirect.test(openRequest.host)) {
			gui.Shell.openExternal(url);
			policy.ignore();
			console.log('Allowing browser to handle: '+ JSON.stringify(openRequest));
		}
	});

    var newLocationToProcess = function(msg)
    {
     	if ( validSlackSubdomain.test(msg) ) {
     		var subdomain = validSlackSubdomain.exec(msg);
     		if ( subdomain[0] && subdomain[0].length > 1 ) {
     			var subdomainFiltered = subdomain[0].substr(0,subdomain[0].length);
     			if ( subdomainFiltered === localStorage.currentDomain ) {
     				localStorage.currentDomain = subdomainFiltered;
     			}
     		}
     	}
    };

	win.on('document-end',function(frame) {
		if ( frame && frame.contentWindow ) {
			newLocationToProcess(frame.contentWindow.location.href);
		}
	});

	webslack.load = function() {
		
	}
})(require('nw.gui'),require('url'),localStorage);
