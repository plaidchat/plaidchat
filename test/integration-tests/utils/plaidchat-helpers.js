// Generate a function that generates plaidchat helpers within the context of nw.js
function definePlaidChatHelpers() {
	// Load in assert in the context of nw.js
	var assert = require('assert');

	// Define global helpers in the context of nw.js
	window.getActiveWindow = function () {
		var activeIframes = document.getElementsByClassName('slack-window--active');
		if (activeIframes.length !== 1) {
			throw new Error('Expected only 1 active slack window but there were "' + activeIframes.length + '"');
		}
		return activeIframes[0].contentWindow;
	};
}
module.exports = definePlaidChatHelpers;
