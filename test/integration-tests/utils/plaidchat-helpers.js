// Generate a function that generates plaidchat helpers within the context of nw.js
function definePlaidChatHelpers() {
	// Load in assert in the context of nw.js
	var assert = require('assert');

	// Define global helpers in the context of nw.js
	window.getActiveContentWindow = function () {
		var activeIframes = document.getElementsByClassName('slack-window--active');
		if (activeIframes.length !== 1) {
			throw new Error('Expected only 1 active slack window but there were "' + activeIframes.length + '"');
		}
		return activeIframes[0].contentWindow;
	};
	window.getAllWindows = function () {
		return document.getElementsByClassName('slack-window');
	};
	window.getWindowByTeamName = function (teamName) {
		var windows = window.getAllWindows();
		var i = 0;
		var len = windows.length;
		for (; i < len; i++) {
			var win = windows[i];
			var contentWindow = win.contentWindow;
			if (contentWindow.location.search.slice(1).indexOf(teamName) === 0) {
				return win;
			}
		}
		return null;
	};
	window.getContentWindowByTeamName = function (teamName) {
		return window.getWindowByTeamName(teamName).contentWindow;
	};
	window.getHiddenWindows = function () {
		return document.querySelectorAll('.slack-window:not(.slack-window--active)');
	};
	window.getHiddenWindowLocations = function () {
		var hiddenSlackWindows = window.getHiddenWindows();
		return [].map.call(hiddenSlackWindows, function saveWindowLocation (iframeEl) {
			return iframeEl.contentWindow.location.href;
		});
	};
}
module.exports = definePlaidChatHelpers;
