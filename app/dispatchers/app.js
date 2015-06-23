(function () {
	'use strict';
	// Load in our dependencies
	var Dispatcher = require('flux').Dispatcher;
	var keyMirror = require('key-mirror');

	// Create a global dispatcher
	var dispatcher = module.exports = new Dispatcher();

	// Expose constants on our dispatcher for keeping channels consistent
	// DEV: keyMirror copies keys to values (e.g. `{TEAMS_UPDATE: 'TEAMS_UPDATE'}`)
	dispatcher.ActionTypes = keyMirror({
		ACTIVATE_TEAM: true,
		APPLICATION_INIT: true,
		NOTIFICATION_UPDATE: true,
		TEAMS_UPDATE: true
	});
}());
