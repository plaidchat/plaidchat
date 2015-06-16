(function () {
	'use strict';
	var assert = require('assert');
	var EventEmitter = require('events').EventEmitter;
	var util = require('util');

	function SlackWindow(iframe) {
		// Inherit from EventEmitter
		EventEmitter.call(this);

		// Save iframe for later
		this.iframe = iframe;

		// Assert we haven't been added to the DOM yet
		assert.strictEqual(iframe.parentNode, null, '`SlackWindow` requires an `iframe` ' +
			'that has not been added to the DOM. This is required to set up `onload` handlers properly. ' +
			'Please initialize `SlackWindow` before adding `iframe` to the DOM');

		// Listen for the teams to load
		var that = this;
		function teamLoadListener() {
			// Unbind our listener (only listen at first load for current implementation)
			iframe.removeEventListener('load', teamLoadListener);

			// Wait for the page to completely load
			function waitForTeamsLoaded() {
				// If we haven't completed loading yet, wait for 100ms
				if (!that.teamsLoaded()) {
					return setTimeout(waitForTeamsLoaded, 100);
				}

				// Otherwise, emit the teams loaded event
				that.emit('teams-loaded');
			}
			waitForTeamsLoaded();
		}
		iframe.addEventListener('load', teamLoadListener);

		// Whenever the window loads (this includes navigation)
		iframe.addEventListener('load', function bindNotificationListeners () {
			// If this is a page with TS on it, then add listeners for unread change events
			// DEV: tinyspeck is Slack's company name, this is likely an in-house framework
			var win = that.getWindow();
			var TS = that.getTS();
			if (TS && !win._plaidchatBoundListeners) {
				// http://viewsource.in/https://slack.global.ssl.fastly.net/31971/js/rollup-client_1420067921.js#L6413-6419
				// DEV: This is the same list that is used for growl notifications (`TS.ui.growls`)
				var emitNotificationUpdate = function () {
					that.emit('notifications-updated');
				};
				var sig;
				if (TS.channels) {
					sig = TS.channels.unread_changed_sig; if (sig) { sig.add(emitNotificationUpdate); }
					sig = TS.channels.unread_highlight_changed_sig; if (sig) { sig.add(emitNotificationUpdate); }
				}
				if (TS.groups) {
					sig = TS.groups.unread_changed_sig; if (sig) { sig.add(emitNotificationUpdate); }
					sig = TS.groups.unread_highlight_changed_sig; if (sig) { sig.add(emitNotificationUpdate); }
				}
				if (TS.ims) {
					sig = TS.ims.unread_changed_sig; if (sig) { sig.add(emitNotificationUpdate); }
					sig = TS.ims.unread_highlight_changed_sig; if (sig) { sig.add(emitNotificationUpdate); }
				}
				if (TS.client) {
					sig = TS.client.login_sig; if (sig) { sig.add(emitNotificationUpdate); }
				}
				win._plaidchatBoundListeners = true;
			}
		});
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
	SlackWindow.prototype.getUnreadCount = function () {
		// http://viewsource.in/https://slack.global.ssl.fastly.net/31971/js/rollup-client_1420067921.js#L6497
		// TODO: Slack makes a distinction between highlights (e.g. @mentions) and normal messages (e.g. chat)
		//   we should consider doing that too. The variable for this is `TS.model.all_unread_highlights_cnt`.
		return this.getTS().model.all_unread_cnt;
	};
	SlackWindow.prototype.getWindow = function () {
		return this.iframe.contentWindow;
	};
	SlackWindow.prototype.getTS = function () {
		var win = this.getWindow();
		return (win && win.TS) || null;
	};
	SlackWindow.prototype.teamsLoaded = function () {
		var win = this.getWindow();
		return win &&  win.TS && win.TS.getAllTeams && win.TS.getAllTeams();
	};

	module.exports = SlackWindow;
})();
