(function () {
	'use strict';
	// Load in our dependencies
	var React = window.React;
	var AppDispatcher = require('../dispatchers/app');

	// Define our TeamSidebar
	module.exports = React.createClass({
		// Name to refer to elements by inside of React
		displayName: 'team-sidebar',

		// Helper for finding non-placeholder teams
		getNonPlaceholderTeams: function () {
			return this.props.teams.filter(function filterPlaceholderTeam (team) {
				return team.is_placeholder !== true;
			});
		},

		// Inform react to expect this data schema
		propTypes: {
			activeTeamId: React.PropTypes.string,
			teams: React.PropTypes.arrayOf(React.PropTypes.shape({
				team_id: React.PropTypes.string
			})),
			teamIcons: React.PropTypes.objectOf(React.PropTypes.shape({
				image_44: React.PropTypes.string
			})),
			teamIndicies: React.PropTypes.objectOf(React.PropTypes.number)
		},

		// When a "add team" click even occurs, then emit an event that a new team addition was requested
		// TODO: Make sure that clicking a new placeholder over and over again doesn't generate many many windows
		// TODO: Make sure that clicking a new placeholder over and over again doesn't generate many many windows
		// TODO: Make sure that clicking a new placeholder over and over again doesn't generate many many windows
		_onAddTeamClick: function (evt) {
			AppDispatcher.dispatch({
				type: AppDispatcher.ActionTypes.ADD_TEAM_REQUESTED
			});
		},
		// When a "team" click event occurs, then emit an event that a team was activated
		_onTeamClick: function (evt) {
			var linkEl = evt.currentTarget;
			var activatedTeamId = linkEl.getAttribute('data-team-id');
			AppDispatcher.dispatch({
				type: AppDispatcher.ActionTypes.ACTIVATE_TEAM,
				teamId: activatedTeamId
			});
		},

		// Render our sidebar with active icons
		render: function () {
			var nonPlaceholderTeams = this.getNonPlaceholderTeams();
			var props = this.props;
			var _onTeamClick = this._onTeamClick;
			return React.DOM.div({
				className: nonPlaceholderTeams.length >= 2 ? 'team-sidebar' : 'team-sidebar hidden'
			}, nonPlaceholderTeams.map(function createTeamRow (team) {
				var teamIcon = props.teamIcons[team.team_id];
				var notificationInfo = props.notificationsByTeamId[team.team_id];
				var unreadHighlightsCount = notificationInfo ? notificationInfo.unreadHighlightsCount : 0;
				if (unreadHighlightsCount > 9) {
					unreadHighlightsCount = '9+';
				}
				return React.DOM.div({
					className: team.team_id === props.activeTeamId ?
							'team-sidebar__row team-sidebar__row--active' :
							(notificationInfo && notificationInfo.unreadCount) ?
								'team-sidebar__row team-sidebar__row--unread' :
								'team-sidebar__row',
					key: props.teamIndicies[team.team_id]
				}, [
					React.DOM.div({
						className: 'badge-container team-sidebar__badge-container',
						key: 'badge-container'
					}, [
						React.DOM.a({
							'data-team-id': team.team_id,
							href: '#',
							key: 'link',
							onClick: _onTeamClick
						}, [
							React.DOM.div({
								key: 'badge',
								className: unreadHighlightsCount ? 'badge' : 'badge hidden'
							}, unreadHighlightsCount.toString()),
							React.DOM.img({
								className: 'icon--small',
								key: 'img',
								src: teamIcon ? teamIcon.image_44 : null
							})
						])
					])
				]);
			}).concat([
					// TODO: Test clicking a team logo in the sidebar
					//    Switches the active iframe
					//    Changes selected team logo in sidebar
									// TODO: Test clicking a team logo to first team
									//    Switches the active iframe
									//    Changes selected team logo in sidebar
					// TODO: Test that clicking "add team" in the sidebar (requires 2 teams existing)
					//   Shows a login iframe
					//   Deselects our app icons
									// Logging into the first existing team
													//    Switches the active iframe
													//    Changes selected team logo in sidebar
									// Logging into the second existing team (regression)
													//    Switches the active iframe
													//    Changes selected team logo in sidebar
					React.DOM.a({
						className: 'team-sidebar__add-team font--alternative link--hidden link--muted text--bold',
						href: '#',
						key: 'add-team-link',
						onClick: this._onAddTeamClick
					}, '+')
			]));
		}
	});
}());
