// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');

// Start our tests
describe('A plaidchat client signed in to 2 teams', function () {
	browserUtils.openPlaidchat();
	browserUtils.execute(function loginToTeam () {
		return window.getActiveContentWindow().signInToTeams(['plaidchat1', 'plaidchat2']);
	});

	describe('upon switching to another via the "Switch to team" links', function () {
		before(function waitForReactToProcessEvents (done) {
			setTimeout(done, 100);
		});
		browserUtils.execute(function setOriginalMarkers () {
			window.getContentWindowByTeamName('plaidchat1').hello = 'world';
			window.getContentWindowByTeamName('plaidchat2').goodbye = 'moon';
		});
		browserUtils.execute(function switchTeams () {
			return window.getActiveContentWindow().document.querySelector('a[href*=\'team.html?plaidchat2\']').click();
		});

		describe('with respect to the active window', function () {
			browserUtils.execute(function getActiveContentWindowLocation () {
				return window.getActiveContentWindow().location.href;
			});

			it('changes the active team', function () {
				expect(this.result).to.match(/team.html\?plaidchat2/);
			});
		});

		describe('with respect to the first team', function () {
			browserUtils.execute(function setOriginalMarker () {
				return window.getContentWindowByTeamName('plaidchat1').hello;
			});

			it('still has a page page and doesn\'t reload it', function () {
				// DEV: If there was no window, then we wouldn't have a property
				expect(this.result).to.equal('world');
			});
		});

		describe('with respect to the second team', function () {
			browserUtils.execute(function setOriginalMarker () {
				return window.getActiveContentWindow().goodbye;
			});

			it('does not reload the second team\'s page', function () {
				expect(this.result).to.equal('moon');
			});
		});
	});
});

// DEV: This is to prevent an edge case of blocking same-site link switches
describe('A plaidchat client signed in to 1 team', function () {
	browserUtils.openPlaidchat();
	browserUtils.execute(function loginToTeam () {
		return window.getActiveContentWindow().signInToTeam('plaidchat1');
	});

	describe('upon switching to another page in our team', function () {
		before(function waitForReactToProcessEvents (done) {
			setTimeout(done, 100);
		});
		browserUtils.execute(function navigateToAnotherPage () {
			return window.getActiveContentWindow().document.querySelector('a[href*=\'team.html?plaidchat1\']').click();
		});

		describe('with respect to the active window', function () {
			browserUtils.execute(function getActiveContentWindowLocation () {
				return window.getActiveContentWindow().location.href;
			});

			it('moves to the next page', function () {
				expect(this.result).to.match(/team.html\?plaidchat1/);
				expect(this.result).to.match(/#customize/);
			});
		});
	});
});
