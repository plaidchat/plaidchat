(function () {
	'use strict';
	// Load in our dependencies
	var React = window.React;
	var AppDispatcher = require('../dispatchers/app');

	// Define our TeamSidebar
	module.exports = React.createClass({
		// Name to refer to elements by inside of React
		displayName: 'team-sidebar',

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

		// When a click event occurs, then emit an event that a team was activated
		_onClick: function (evt) {
			var linkEl = evt.currentTarget;
			var activatedTeamId = linkEl.getAttribute('data-team-id');
			AppDispatcher.dispatch({
				type: AppDispatcher.ActionTypes.ACTIVATE_TEAM,
				teamId: activatedTeamId
			});
		},

		// Render our sidebar with active icons
		render: function () {
			var props = this.props;
			var _onClick = this._onClick;
			return React.DOM.div({
				className: props.teams.length >= 2 ? 'team-sidebar' : 'team-sidebar hidden'
			}, props.teams.map(function createTeamRow (team) {
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
							onClick: _onClick
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
			}));
		}
	});
}());
