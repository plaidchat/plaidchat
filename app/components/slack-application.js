(function () {
	'use strict';
	// Load in our dependencies
	var _ = require('underscore');
	var AppTray = window.AppTray;
	var React = window.React;
	var AppDispatcher = require('../dispatchers/app');
	var SlackWindow = require('./slack-window');
	var TeamStore = require('../stores/team');
	var TeamSidebar = require('./team-sidebar');

	// Define our constants
	// DEV: LAST_ACTIVE_SUBDOMAIN_KEY is deprecated
	var LAST_ACTIVE_SUBDOMAIN_KEY = 'currentDomain';
	var LAST_ACTIVE_TEAM_URL_KEY = 'plaidchat-last-active-team-url';

	// Define helper to get state from our stores
	function getStateFromStores() {
		return {
			activeTeamId: TeamStore.getActiveTeamId(),
			teams: TeamStore.getTeams(),
			teamsById: TeamStore.getTeamsById(),
			teamIndicies: TeamStore.getTeamIndicies(),
			teamIcons: TeamStore.getTeamIcons()
		};
	}

	// Define our SlackApplication
	var SlackApplication = React.createClass({
		// Key to refer to element by in React
		displayName: 'slack-application',

		// When our application loads/unloads start/stop listening for change events in our teams
		//   and load/unload non-react components (e.g. Tray)
		componentDidMount: function () {
			TeamStore.addChangeListener(this._onChange);
			AppTray.mount();
		},
		componentWillUnmount: function () {
			TeamStore.removeChangeListener(this._onChange);
			AppTray.unmount();
		},

		// When our application updates, save the active team for when we re-open our application
		componentWillUpdate: function (nextProps, nextState) {
			var activeTeam = nextState.teamsById[nextState.activeTeamId];
			if (activeTeam) {
				var teamUrl = activeTeam.team_url;
				console.debug('Saving next active team URL', teamUrl);
				window.localStorage[LAST_ACTIVE_TEAM_URL_KEY] = teamUrl;
			}
		},

		// Upon initialization, grab our team info
		getInitialState: function () {
			return getStateFromStores();
		},

		// Render our team info to a sidebar and window
		render: function () {
			// Grab out teams and their indicies
			// DEV: We use indicies as the `key` for teams as it persists between placeholders and actual teams
			var activeTeamId = this.state.activeTeamId;
			var teams = this.state.teams;
			var teamIndicies = this.state.teamIndicies;

			// Load in our windows
			return React.DOM.div({
				className: 'slack-application'
			}, [
				React.createElement(TeamSidebar, _.defaults({
					key: 'sidebar'
				}, _.pick(this.state, 'activeTeamId', 'teams', 'teamIcons', 'teamIndicies'))),
				React.DOM.div({
					className: 'slack-window-container',
					key: 'window-container'
				}, teams.map(function generateSlackWindow (team) {
					return React.createElement(SlackWindow, {
						active: team.team_id === activeTeamId,
						key: teamIndicies[team.team_id],
						team: team
					});
				}))
			]);
		},

		// Whenever a team event occurs, update our state (which causes a re-render)
		_onChange: function () {
			this.setState(getStateFromStores());
		}
	});

	// Define a class method to load initial teams
	SlackApplication.loadInitialTeams = function () {
		// Retrieve the last active team URL (e.g. `https://plaidchat-test.slack.com/`)
		var lastActiveTeamUrl = window.localStorage[LAST_ACTIVE_TEAM_URL_KEY];

		// If there is none, try a legacy fallback
		if (!lastActiveTeamUrl) {
			// `plaidchat-test` -> `https://plaidchat-test.slack.com`
			var lastActiveSubdomain = window.localStorage[LAST_ACTIVE_SUBDOMAIN_KEY];
			lastActiveTeamUrl = lastActiveSubdomain ?  'https://' + lastActiveSubdomain + '.slack.com/' : null;
		}

		// In any case, load a placeholder team on a URL (defaults to login.slack.com)
		AppDispatcher.dispatch({
			type: AppDispatcher.ActionTypes.APPLICATION_INIT,
			url: lastActiveTeamUrl
		});
	};

	// Export SlackApplication
	module.exports = SlackApplication;
})();
