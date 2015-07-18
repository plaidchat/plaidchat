// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');

// Start our tests
describe('A plaidchat client signed in to 2 teams', function () {
	browserUtils.openPlaidchat();
	browserUtils.execute(function loginToTeam () {
		return window.getActiveContentWindow().signInToTeams(['plaidchat1', 'plaidchat2']);
	});

	describe('logging into another team via the "Sign in to another team..." link', function () {
		before(function waitForReactToProcessEvents (done) {
			setTimeout(done, 100);
		});
		browserUtils.execute(function setOriginalMarker () {
			window.getContentWindowByTeamName('plaidchat1').hello = 'world';
		});
		browserUtils.execute(function navigateToSignInPage () {
			return window.getActiveContentWindow().document.getElementById('signin-link').click();
		});

		describe('upon navigating back to the first team via the sidebar', function () {
			before(function waitForReactToProcessEvents (done) {
				setTimeout(done, 100);
			});
			browserUtils.execute(function clickFirstTeamSidebar () {
				return document.querySelector('img[src$=plaidchat1]').click();
			});

			describe('with respect to the active window', function () {
				browserUtils.execute(function getOriginalMarker () {
					return window.getActiveContentWindow().hello;
				});
				it('does not reload the first team\'s page', function () {
					expect(this.result).to.equal('world');
				});
			});

			// TODO: Repair this behavior as it causes leaks
			describe.skip('with respect to the hidden windows', function () {
				browserUtils.execute(function getHiddenWindowLocations () {
					return window.getHiddenWindowLocations();
				});

				it('has no extra windows (i.e. the placeholder was cleaned up)', function () {
					expect(this.result).to.have.length(1);
					expect(this.result[0]).to.match(/team.html\?plaidchat2/);
				});
			});
		});
	});
});

describe('A plaidchat client signed in to 2 teams', function () {
	browserUtils.openPlaidchat();
	browserUtils.execute(function loginToTeam () {
		return window.getActiveContentWindow().signInToTeams(['plaidchat1', 'plaidchat2']);
	});

	describe('logging into another team via the "Sign in to another team..." link', function () {
		before(function waitForReactToProcessEvents (done) {
			setTimeout(done, 100);
		});
		browserUtils.execute(function setOriginalMarker () {
			window.getContentWindowByTeamName('plaidchat2').hello = 'world';
		});
		browserUtils.execute(function navigateToSignInPage () {
			return window.getActiveContentWindow().document.getElementById('signin-link').click();
		});

		describe('upon navigating back to the second team via the sidebar', function () {
			before(function waitForReactToProcessEvents (done) {
				setTimeout(done, 100);
			});
			browserUtils.execute(function clickSecondTeamSidebar () {
				return document.querySelector('img[src$=plaidchat2]').click();
			});

			describe('with respect to the active window', function () {
				browserUtils.execute(function getOriginalMarker () {
					return window.getActiveContentWindow().hello;
				});

				it('does not reload the second team\'s page', function () {
					expect(this.result).to.equal('world');
				});
			});

			// TODO: Repair this behavior as it causes leaks
			describe.skip('with respect to the hidden windows', function () {
				browserUtils.execute(function getHiddenWindowLocations () {
					return window.getHiddenWindowLocations();
				});

				it('has no extra windows (i.e. the placeholder was cleaned up)', function () {
					expect(this.result).to.have.length(1);
					expect(this.result[0]).to.match(/team.html\?plaidchat1/);
				});
			});
		});
	});
});
