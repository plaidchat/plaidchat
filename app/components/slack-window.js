(function () {
	'use strict';
	// Load in our dependencies
	var React = window.React;
	var TeamStore = require('../stores/team');
	var AppDispatcher = require('../dispatchers/app');

	// Define our SlackWindow
	module.exports = React.createClass({
		// Upon page load, start listening for notification events
		addNotificationListeners: function () {
			// If this is a page with TS on it, then add listeners for unread change events
			// DEV: tinyspeck is Slack's company name, this is likely an in-house framework
			var win = this.getWindow();
			var TS = this.getTS();
			if (TS && !win._plaidchatBoundListeners) {
				// http://viewsource.in/https://slack.global.ssl.fastly.net/31971/js/rollup-client_1420067921.js#L6413-6419
				// DEV: This is the same list that is used for growl notifications (`TS.ui.growls`)
				var sig;
				if (TS.channels) {
					sig = TS.channels.unread_changed_sig; if (sig) { sig.add(this._onNotificationUpdate); }
					sig = TS.channels.unread_highlight_changed_sig; if (sig) { sig.add(this._onNotificationUpdate); }
				}
				if (TS.groups) {
					sig = TS.groups.unread_changed_sig; if (sig) { sig.add(this._onNotificationUpdate); }
					sig = TS.groups.unread_highlight_changed_sig; if (sig) { sig.add(this._onNotificationUpdate); }
				}
				if (TS.ims) {
					sig = TS.ims.unread_changed_sig; if (sig) { sig.add(this._onNotificationUpdate); }
					sig = TS.ims.unread_highlight_changed_sig; if (sig) { sig.add(this._onNotificationUpdate); }
				}
				if (TS.client) {
					sig = TS.client.login_sig; if (sig) { sig.add(this._onNotificationUpdate); }
				}
				win._plaidchatBoundListeners = true;
			}
		},

		// Upon clicking an element
		addClickListeners: function () {
			var win = this.getWindow();
			var bodyEl = win.document.body;
			var that = this;
			win.addEventListener('click', function handleClick (evt) {
				// If the target isn't a link, skip it
				// DEV: This is a lo-fi event delegation. If we ever use it elsewhere, please use something more formal
				var targetEl = evt.target;
				while (targetEl !== bodyEl) {
					if (targetEl.tagName.toLowerCase() === 'a') {
						break;
					}
					targetEl = targetEl.parentNode;
				}
				if (targetEl === bodyEl) {
					return;
				}

				// If we are a team page and navigating to the "Sign In" page
				// DEV: Localize `href` to prevent requeries on the DOM
				var targetHref = targetEl.href;
				if (that.teamsLoaded() && targetHref === TeamStore.SLACK_LOGIN_URL) {
					// Stop the default action
					console.debug('Preventing default sign in action. Overriding with new plaidchat window');
					evt.preventDefault();
					evt.stopPropagation();

					// Open a new placeholder sign in page
					AppDispatcher.dispatch({
						type: AppDispatcher.ActionTypes.ADD_TEAM_REQUESTED
					});
					return;
				}

				// If we are navigating to a known team page
				//   (e.g. clicking a "Switch to team" link on either team page or sign in)
				var i = 0;
				var knownTeams = that.props.teams;
				var len = knownTeams.length;
				for (; i < len; i++) {
					var knownTeam = knownTeams[i];

					// If this is the current team, skip it. This is not a switcher so don't block it
					// DEV: If we ever have an action which switches teams AND it's URL, then start tracking all window locations
					//   and always update the `contentWindow` location `onComponentUpdate` (if the location changed)
					//   Also, we will need to block some `shouldComponentUpdate` with a deepEqual on props
					//   since we might not have loaded our changes into the stores yet
					if (knownTeam.team_id === that.props.team.team_id) {
						continue;
					}

					// DEV: This integration will break if a team URL ever becomes a substring of another
					//   Thankfully, `https://plaidchat-test.slack.com/` can never be a substring in the hostname
					// DEV: Slack navigates to `https://plaidchat-test.slack.com/messages`
					if (targetHref.indexOf(knownTeam.team_url) === 0) {
						// Stop the default action
						console.debug('Preventing default switch team action. Overriding with plaidchat team switch', {
							href: targetHref,
							team_url: knownTeam.team_url
						});
						evt.preventDefault();
						evt.stopPropagation();

						// Open a new placeholder sign in page
						AppDispatcher.dispatch({
							type: AppDispatcher.ActionTypes.ACTIVATE_TEAM,
							teamId: knownTeam.team_id
						});
						return;
					}
				}
			});
		},

		// When React adds/removes our `iframe` to the DOM
		componentDidMount: function () {
			// Whenever the iframe loads (e.g. we change pages for logging into a team)
			var iframeEl = React.findDOMNode(this.refs.iframe);
			iframeEl.addEventListener('load', this._onload);

			// Set src ouside of React to prevent reloading due to `src` change
			var team = this.props.team || {};
			iframeEl.src = team.team_url;

			// Blur the window to prevent accidentally recognizing notifications
			// DEV: To reproduce, you will need a test Slack team (e.g. `plaidchat-test`) and 2 test users
			//   1. Log into both Slack teams in `plaidchat`
			//   2. Go to an easy to remember channel (e.g. `#general`) in the second team
			//   3. Select the first team as the active team
			//   4. Close plaidchat
			//   5. Via another interface (e.g. web), send a message to the channel of the second team (e.g. `#general`)
			//   6. Open plaidchat
			//   7. There should be a notification that appears and then disappears upon loading
			// Another way to test is with the same setup except:
			//   8. Don't click anything once plaidchat has opened
			//   9. Send another message via another interface (e.g. web)
			//   10. Click on menu bar of plaichat and see notification disappear
			if (!this.props.active) {
				iframeEl.blur();
			}
		},
		componentDidUpdate: function () {
			// Prevent accidental notifications still
			if (!this.props.active) {
				var iframeEl = React.findDOMNode(this.refs.iframe);
				iframeEl.blur();
			}
		},
		componentWillUnmount: function () {
			// If we are about to unmount, remove our load listener
			var iframeEl = React.findDOMNode(this.refs.iframe);
			iframeEl.removeEventListener(this._onload);

			// Stop our team loader timeout
			this._clearTeamsLoaded();
		},

		// Element name to use inside of React
		displayName: 'slack-window',

		// Methods for accessing team information
		getAllTeams: function () {
			// [{id: user_id, name: user_name, team_id, team_name, team_url,
			//   team_icon: {image_34: http://url/34.png, image_{44,68,88,102,132}, image_default: true}}]
			// DEV: The first team doesn't have `team_icon` set
			var win = this.getWindow();
			return win.TS.getAllTeams();
		},
		getThisTeam: function () {
			// {id: id (team), name: name (team), domain: 'plaidchat-test', email_domain: 'mailinator.com',
			//   msg_edit_window_mins, prefs: {default_channels, ...},
			//   icon: {image_34: http://url/34.png, image_{44,68,88,102,132}, image_default: true},
			//   over_storage_limit, plan, url: wss://ms144.slack-msgs.com, activity}
			var win = this.getWindow();
			return win.TS.model.team;
		},
		getUrl: function () {
			var iframeEl = React.findDOMNode(this.refs.iframe);
			return iframeEl.contentWindow.location.href;
		},
		getTS: function () {
			var win = this.getWindow();
			return win.TS;
		},
		getWindow: function () {
			var iframeEl = React.findDOMNode(this.refs.iframe);
			return iframeEl.contentWindow;
		},

		// Listeners for iframe/Slack events
		_onload: function () {
			// When our page loads, hook up listeners
			this.addNotificationListeners();
			this.addClickListeners();
			this.resetTeamsLoaded();
			this.watchTeamsLoaded();
		},
		_onNotificationUpdate: function () {
			// When our notification count changes, emit an event for the team with our unread count
			// http://viewsource.in/https://slack.global.ssl.fastly.net/31971/js/rollup-client_1420067921.js#L6497
			AppDispatcher.dispatch({
				type: AppDispatcher.ActionTypes.NOTIFICATION_UPDATE,
				teamId: this.getThisTeam().id,
				unreadCount: this.getTS().model.all_unread_cnt,  // DEV: This will include `highlights` in its count
				unreadHighlightsCount: this.getTS().model.all_unread_highlights_cnt
			});
		},

		// Tell react the type of data that we expect
		propTypes: {
			active: React.PropTypes.bool,
			team: React.PropTypes.shape({
				team_id: React.PropTypes.string,
				team_url: React.PropTypes.string.isRequired
			}).isRequired
		},

		// Whenever an update event occurs, this updates the virtual DOM for react
		//   If any changes occurred, then React will update the real dom with those changes
		render: function () {
			var $iframe = React.DOM.iframe({
				className: this.props.active ? 'slack-window slack-window--active' : 'slack-window hidden',
				frameBorder: '0',
				nwdisable: true,
				nwfaketop: true,
				ref: 'iframe'
			});
			return $iframe;
		},

		// Methods for interacting with teams
		_clearTeamsLoaded: function () {
			return clearTimeout(this.teamsLoadedTimeout);
		},
		resetTeamsLoaded: function () {
			// Stop the current loop for teams loaded
			console.debug('An iframe reloaded, clearing out its existing `watchTeamsLoaded` timeout');
			return this._clearTeamsLoaded();
		},
		teamsLoaded: function () {
			var win = this.getWindow();
			return win &&  win.TS && win.TS.getAllTeams && win.TS.getAllTeams();
		},
		watchTeamsLoaded: function (count) {
			// If we haven't completed loading yet, wait for 100ms
			if (!this.teamsLoaded()) {
				count = (count || 0) + 1;
				if (count % 10 === 0) {
					console.debug('Teams not loaded yet for "' + this.getUrl() + '".');
				}
				this.teamsLoadedTimeout = setTimeout(this.watchTeamsLoaded.bind(this, count), 100);
				return;
			}

			// Otherwise, update the teams
			console.debug('Teams loaded for "' + this.getUrl() + '". Updating properties');
			var thisTeam = this.getThisTeam();
			AppDispatcher.dispatch({
				type: AppDispatcher.ActionTypes.TEAMS_UPDATE,
				// Alias the current iframe's key to its new key
				// DEV: This is no cost if the key is already the same
				//   However, if it's a placeholder being converted to a window then we need this
				// 	This avoids reloading of our iframe because the key will stay consistent
				alias: {
					srcTeamId: this.props.team.team_id,
					targetTeamId: thisTeam.id
				},
				// `getAllTeams` does not have `team_icon` set for `thisTeam` so we set it here
				teamIcon: {
					teamId: thisTeam.id,
					teamIcon: thisTeam.icon
				},
				// Send all team info
				allTeams: this.getAllTeams()
			});
		}
	});
}());
