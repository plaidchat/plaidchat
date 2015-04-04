(function () {
	'use strict';
	var EventEmitter = require('events').EventEmitter;
	var util = require('util');

	function SlackWindow(iframe) {
		// Inherit from EventEmitter
		EventEmitter.call(this);

		// Save iframe for later
		this.iframe = iframe;

		// When the page has loaded, fire a `chat-loaded` event
		// DEV: This is to prevent ambiguity when loading "Team Choose" screen initially
		// TODO: Verify this works when arriving at "Team Choose" screen on initial load
		var that = this;
		function loaded() {
			that.emit('chat-loaded');
		}

		// If the page hasn't loaded yet, set up a listener
		if (!this.hasLoaded()) {
			// Wait for our page to partially load
			iframe.onload = function () {
				// Reset the onload handler to prevent multiple executions
				iframe.onload = function () {};

				// Wait for the page to completely load
				function waitForLoaded() {
					// If we haven't completed loading yet, wait for 100ms
					if (!that.hasLoaded()) {
						return setTimeout(waitForLoaded, 100);
					}

					// Otherwise, call our loaded handler
					loaded();
				}
				waitForLoaded();
			};
		}
	}
	util.inherits(SlackWindow, EventEmitter);
	SlackWindow.prototype.getTeam = function () {
		var win = this.getWindow();
		return win.TS.model.team;
	};
	SlackWindow.prototype.getAllTeams = function () {
		var win = this.getWindow();
		return win.TS.getAllTeams();
	};
	SlackWindow.prototype.getWindow = function () {
		return this.iframe.contentWindow;
	};
	SlackWindow.prototype.hasLoaded = function () {
		var win = this.getWindow();
		return win &&  win.TS && win.TS.getAllTeams && win.TS.getAllTeams();
	};

	module.exports = SlackWindow;
})();
