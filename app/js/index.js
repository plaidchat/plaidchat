(function(gui,urllib) {
	'use strict';
	var win = gui.Window.get();
	var validSlackRedirect = /(.+\.)?slack-redir.com/i;

	win.on('new-win-policy',function (frame, url, policy) {
		var openRequest = urllib.parse(url);

		if ( validSlackRedirect.test(openRequest.host)) {
			gui.Shell.openExternal(url);
			policy.ignore();
			console.log('Allowing browser to handle: '+ JSON.stringify(openRequest));
		}
		
	});
})(require('nw.gui'),require('url'));
