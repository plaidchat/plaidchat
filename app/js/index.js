(function () {
	'use strict';
	// Load in our dependencies
	var fs = require('fs');
	var gui = require('nw.gui');
	var url = require('url');
	var _ = require('underscore');
	var getUri = require('get-uri');
	var program = require('commander');
	// DEV: Relative paths are from perspective of `views/index.html` for `index.js`
	var SlackWindow = require('../js/slack-window.js');
	var pkg = require('../../package.json');

	// Define our constants
	var LOCAL_STORAGE_KEY_CURRENT_DOMAIN = 'currentDomain';
	var SLACK_DOMAIN = 'slack.com';
	var SLACK_LOGIN_URL = 'https://slack.com/signin';
	var webslack = {};

	var win = gui.Window.get();
	var validSlackSubdomain = /(.+)\.slack.com/i;
	var slackDownloadHostname = 'files.slack.com';

	// Interpet our CLI arguments
	// DEV: We need to coerce `nw.js'` arguments as `commander` expects normal (`['node', 'slack-for-linux', '--help']`)
	//   but `nw.js` only provides arguments themselves (e.g. `--help`)
	var argv = ['nw', pkg.name].concat(gui.App.argv);
	program
		.version(pkg.version)
		.option('--minimize-to-tray')
		.parse(argv);

	win.on('new-win-policy', function (frame, urlStr, policy) {
		// Determine where the request is to
		var openRequest = url.parse(urlStr);

		// If the request is for a file, download it
		// DEV: Files can be found on `files.slack.com`
		//   https://files.slack.com/files-pri/{{id}}/download/tmp.txt
		if (openRequest.hostname === slackDownloadHostname) {
			policy.forceDownload();
			console.log('Downloading file: ', urlStr);
			return;
		}

		// Otherwise, open the window via our browser
		// DEV: An example request is a redirect
		//   https://slack-redir.net/link?url=http%3A%2F%2Fgoogle.com%2F
		gui.Shell.openExternal(urlStr);
		policy.ignore();
		console.log('Allowing browser to handle: ' + JSON.stringify(openRequest));
	});

	var isHidden = false;

	win.on('hide', function () {
		isHidden = true;
	});
	win.on('minimize', function () {
		isHidden = true;
	});
	win.on('show', function () {
		isHidden = false;
	});
	win.on('restore', function () {
		isHidden = false;
	});

	var windowShowCommand = program.minimizeToTray ? 'show' : 'restore';
	var windowHideCommand = program.minimizeToTray ? 'hide' : 'minimize';

	function showWindow() {
		win[windowShowCommand]();
		isHidden = false;
	};
	function hideWindow() {
		win[windowHideCommand]();
		isHidden = true;
	};

  gui.App.on('open', function (cmdline) {
		showWindow();
  });

	function toggleVisibility() {
		if (isHidden) {
			showWindow();
		} else {
			hideWindow();
		}
	}

	var trayIcon = 'images/app-32.png';
	var tray = new gui.Tray({
		title: pkg.window.title,
		icon: trayIcon, // Relative to `package.json`
		click: toggleVisibility
	});
	var trayMenu = new gui.Menu();
	trayMenu.append(new gui.MenuItem({
		label: 'Show/Hide window',
		click: toggleVisibility
	}));
	trayMenu.append(new gui.MenuItem({
		type: 'separator'
	}));
	trayMenu.append(new gui.MenuItem({
		label: 'Exit',
		click: function () {
			process.exit();
		}
	}));
	tray.menu = trayMenu;

	// Generate badge-able favicon for notifications
	var trayIconImg = document.createElement('link');
	trayIconImg.href = '../' + trayIcon; // Relative to `index.html`
	var favicon = new window.Favico({
		element: trayIconImg,
		dataUrl: function (dataUrl) {
			// Generate a location to save the image
			var filepath = process.env.HOME + '/.slack-for-linux-tray.png';

			// Convert the image to a stream
			getUri(dataUrl, function handleData (err, dataStream) {
				// If there was an error, log it (nothing to do regarding the image)
				if (err) {
					console.error(err);
				}

				// Generate a new write stream to the file
				var iconFile = fs.createWriteStream(filepath);
				dataStream.pipe(iconFile);
				dataStream.on('error', console.error);
				iconFile.on('finish', function handleNewIcon () {
					tray.icon = filepath;
				});
			});
		}
	});

	function createSlackIframe(url) {
		var iframe = document.createElement('iframe');
		if (url) {
			iframe.setAttribute('src', url);
		}
		iframe.setAttribute('frameBorder', '0');
		iframe.setAttribute('nwdisable', '');
		iframe.setAttribute('nwfaketop', '');
		return iframe;
	}

	// On the initial page load
	webslack.load = function () {
		function newLocationToProcess(locationToProcess) {
			var locationHostname = url.parse(locationToProcess).hostname;

			if (validSlackSubdomain.test(locationHostname)) {
				var subdomain = validSlackSubdomain.exec(locationHostname);
				if (subdomain[1] && subdomain[1].length > 1) {
					var subdomainFiltered = subdomain[1];

					if (subdomainFiltered !== localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_DOMAIN)) {
						localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_DOMAIN, subdomainFiltered);
					}
				}
			} else if (locationHostname === SLACK_DOMAIN) {
				localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_DOMAIN);
			}
		}

		// When a new page loads, process its location
		function processActiveWindowChange(frame) {
			// If the frame is our active frame, then process its location
			if (frame && frame === activeWindow.iframe && frame.contentWindow) {
				newLocationToProcess(frame.contentWindow.location.href);
			}
		}
		win.on('document-start', processActiveWindowChange);

		// Open our last page
		var openUrl = SLACK_LOGIN_URL;
		if (localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_DOMAIN)) {
			openUrl = 'https://' + localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_DOMAIN) + '.slack.com/';
		}
		var iframe = createSlackIframe(openUrl);
		iframe.className = 'slack-window slack-window--active';

		// Create a container for window interactions
		var activeWindow = new SlackWindow(iframe);

		// Render the window on the page
		document.body.appendChild(iframe);

		// When the window loads
		activeWindow.on('teams-loaded', function handleLoad () {
			// Gather team info
			// team = {id:, name: "slack-for-linux test", email_domain: mailinator.com, domain: account name,
			//   msg_edit_window_mins, prefs: {default_channels, ...},
			//   icon: {image_34: http://url/34.png, image_{44,68,88,102,132}, image_default: true},
			//   over_storage_limit, plan, url: wss://ms144.slack-msgs.com, activity}
			var activeTeam = activeWindow.getTeam();
			// DEV: Active team inside of `team` *does not* include `icon`
			// teams = [{id: user id, name: user name, team_id, team_name: account name, team_name,
			//   team_icon: {image_34: http://url/34.png, image_{44,68,88,102,132}, image_default: true},
			//   team_url: https://subdomain.slack.com/}]
			var teams = activeWindow.getAllTeams();

			// Save our team to the window mapping
			var teamWindows = {};
			var teamListItems = {};
			var teamIconMap = {};
			teamWindows[activeTeam.id] = activeWindow;
			teamIconMap[activeTeam.id] = activeTeam.icon;

			// Define notification counter/calculator
			function _handleNotificationUpdate() {
				// Calculate the total amount of notifications in each window
				var slackWindows = _.values(teamWindows);
				var unreadTotal = slackWindows.reduce(function addNotificationCount (sum, slackWindow) {
					var unreadCount = (slackWindow.getTS() && slackWindow.getUnreadCount()) || 0;
					return unreadCount + sum;
				}, 0);

				// Update our badge
				if (unreadTotal) {
					favicon.badge(unreadTotal);
				} else {
					favicon.reset();
				}
			}
			var handleNotificationUpdate = _.debounce(_handleNotificationUpdate, 100);

			// Create windows for other teams
			teams.forEach(function generateWindow (team) {
				// If there is a team window, continue
				if (teamWindows[team.team_id]) {
					return;
				}

				// Create/load the iframe
				var iframe = createSlackIframe(team.team_url);
				iframe.className = 'slack-window hidden';
				var slackWindow = new SlackWindow(iframe);
				document.body.appendChild(iframe);

				// Save it to our team mapping
				teamWindows[team.team_id] = slackWindow;
				teamIconMap[team.team_id] = team.team_icon;
			});

			// Create a helper to mark activated link items
			var activeListItem;
			function markActiveListItem(listItem) {
				// If the item is the active item, do nothing
				if (listItem === activeListItem) {
					return;
				}

				// Otherwise, adjust our flags
				if (activeListItem) {
					activeListItem.classList.remove('team-select__item--active');
				}
				listItem.classList.add('team-select__item--active');
				activeListItem = listItem;
			}

			// Generate a sidebar for our teams
			var sidebar = document.createElement('div');
			var linkList = document.createElement('div');
			sidebar.className = 'team-select';
			teams.forEach(function addTeamIcon (team, i) {
				// Create a link for the team
				var linkListItem = document.createElement('p');
				var teamLink = document.createElement('a');
				linkListItem.className = 'team-select__item';
				var teamImg = document.createElement('img');
				var teamIcon = teamIconMap[team.team_id];
				teamImg.src = teamIcon.image_44;
				teamLink.href = '#';

				// Resolve the team window
				var teamWindow = teamWindows[team.team_id];

				// When the link is clicked, swap active windows
				teamLink.onclick = function () {
					// If the new window is the current window, do nothing
					if (activeWindow.iframe === teamWindow.iframe) {
						return;
					}

					// Otherwise, update our frames
					activeWindow.iframe.classList.remove('slack-window--active');
					activeWindow.iframe.classList.add('hidden');
					teamWindow.iframe.classList.add('slack-window--active');
					teamWindow.iframe.classList.remove('hidden');
					activeWindow = teamWindow;

					// Update the link activity
					markActiveListItem(linkListItem);

					// Update the default page to load
					processActiveWindowChange(activeWindow.iframe);
				};
				teamLink.appendChild(teamImg);
				linkListItem.appendChild(teamLink);
				linkList.appendChild(linkListItem);

				// Save the list item by id
				teamListItems[team.team_id] = linkListItem;

				// When a notification is updated, run our notification update handler
				teamWindow.on('notifications-updated', handleNotificationUpdate);
			});

			// Mark the active list item
			markActiveListItem(teamListItems[activeTeam.id]);

			// If we have more than 1 teams, bind to the DOM
			sidebar.appendChild(linkList);
			if (teams.length > 1) {
				document.body.appendChild(sidebar);
			}
		});
	};

	window.webslack = webslack;
})();
