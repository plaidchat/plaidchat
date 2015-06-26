(function () {
	'use strict';
	// Load in our dependencies
	var EventEmitter = require('events').EventEmitter;
	var _ = require('underscore');
	var assign = require('object-assign');
	var AppDispatcher = require('../dispatchers/app');
	var TeamStore = require('./team');
	var ActionTypes = AppDispatcher.ActionTypes;

	// Define constants
	var CHANGE_EVENT = 'change';

	// Define our internal storage system
	var _state;
	function _reset() {
		_state = {
			notificationsByTeamId: {}
		};
	}
	_reset();

	// Define our NotificationStore
	var NotificationStore = assign({}, EventEmitter.prototype, {
		// Define common bindings for events
		addChangeListener: function (cb) {
			this.on(CHANGE_EVENT, cb);
		},
		emitChange: function () {
			this.emit(CHANGE_EVENT);
		},
		removeChangeListener: function (cb) {
			this.off(CHANGE_EVENT, cb);
		},

		// Define methods for managing notifications
		cleanupTeamNotifications: function () {
			// Get the currently active teams
			var teams = TeamStore.getTeams();

			// Remove any inactive teams
			// activeTeamIds = ['abc', 'def']
			// notificationsByTeamId = {'abc': 2, 'xyz': 3}
			// excessTeamNotifications = {'xyz': 3}
			var activeTeamIds = _.pluck(teams, 'team_id');
			var excessTeamNotifications = _.omit(_state.notificationsByTeamId, activeTeamIds);
			// DEV: Thanks to React, we don't need a bind here (magic)
			// ['xyz'].forEach(unsetTeamNotifications)
			Object.keys(excessTeamNotifications).forEach(this.unsetTeamNotifications);
		},
		getNotificationsByTeamId: function () {
			return _.clone(_state.notificationsByTeamId);
		},
		getNotificationTotal: function () {
			var notificationCounts = _.values(_state.notificationsByTeamId);
			return notificationCounts.reduce(function sumNotificationCounts (sum, notificationCount) {
				return sum + (notificationCount || 0);
			}, 0);
		},
		setTeamNotifications: function (teamId, notificationCount) {
			_state.notificationsByTeamId[teamId] = notificationCount;
		},
		unsetTeamNotifications: function (teamId) {
			delete _state.notificationsByTeamId[teamId];
		}
	});

	// Define our handler for various updates
	NotificationStore.dispatchToken = AppDispatcher.register(function handleAction (action) {
		// When a notification update occurs
		if (action.type === ActionTypes.NOTIFICATION_UPDATE) {
			console.debug('Updating team notifications', {
				teamId: action.teamId,
				notificationCount: action.notificationCount
			});
			NotificationStore.setTeamNotifications(action.teamId, action.notificationCount);
			NotificationStore.emitChange();
		// When a team update occurs
		} else if (action.type === ActionTypes.TEAMS_UPDATE) {
			// Wait for it to complete
			console.debug('Handling teams update for notifications');
			AppDispatcher.waitFor([TeamStore.dispatchToken]);

			// Then, update our notifications
			NotificationStore.cleanupTeamNotifications();
			NotificationStore.emitChange();
		}
	});

	// Export our NotificationStore
	module.exports = NotificationStore;
})();
