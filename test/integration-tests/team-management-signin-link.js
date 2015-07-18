// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');

// Start our tests
describe('A plaidchat client signed in to 1 team', function () {
	browserUtils.openPlaidchat();
	browserUtils.execute(function loginToTeam () {
		return window.getActiveContentWindow().signInToTeam('plaidchat1');
	});

	describe('logging into another team via the "Sign in to another team..." link', function () {
		before(function waitForReactToProcessEvents (done) {
			setTimeout(done, 100);
		});
		browserUtils.execute(function setOriginalMarker () {
			window.getActiveContentWindow().hello = 'world';
		});
		browserUtils.execute(function navigateToSignInPage () {
			return window.getActiveContentWindow().document.getElementById('signin-link').click();
		});

		describe('upon navigating back to the original team via signin link', function () {
			browserUtils.execute(function loginToOriginalTeam () {
				return window.getActiveContentWindow().signInToTeam('plaidchat1');
			});

			describe('with respect to the active window', function () {
				browserUtils.execute(function getOriginalMarker () {
					return window.getActiveContentWindow().hello;
				});

				it('does not reload the original page', function () {
					expect(this.result).to.equal('world');
				});
			});

			describe('with respect to the sidebar', function () {
				browserUtils.execute(function getSidebarInfo () {
					var sidebar = document.getElementsByClassName('team-sidebar')[0];
					return sidebar.classList;
				});

				it('is not visible', function () {
					expect(this.result).to.contain('hidden');
				});
			});

			describe('with respect to the hidden windows', function () {
				browserUtils.execute(function getHiddenWindowLocations () {
					return window.getHiddenWindowLocations();
				});

				it('has no extra windows (i.e. the placeholder was cleaned up)', function () {
					expect(this.result).to.have.length(0);
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
			window.getContentWindowByTeamName('plaidchat1').hello = 'world';
		});
		browserUtils.execute(function navigateToSignInPage () {
			return window.getActiveContentWindow().document.getElementById('signin-link').click();
		});

		describe('upon navigating back to the first team via the links on the sign in page', function () {
			before(function waitForReactToProcessEvents (done) {
				setTimeout(done, 100);
			});
			browserUtils.execute(function loginToTeam () {
				return window.getActiveContentWindow().signInToTeams(['plaidchat1', 'plaidchat2']);
			});

			describe('with respect to the active window', function () {
				browserUtils.execute(function getOriginalMarker () {
					return window.getActiveContentWindow().hello;
				});
				it('does not reload the first team\'s page', function () {
					expect(this.result).to.equal('world');
				});
			});

			describe('with respect to the hidden windows', function () {
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

		describe('upon navigating back to the second team via the links on the sign in page', function () {
			before(function waitForReactToProcessEvents (done) {
				setTimeout(done, 100);
			});
			browserUtils.execute(function loginToTeam () {
				return window.getActiveContentWindow().signInToTeams(['plaidchat2', 'plaidchat1'], {useLink: true});
			});

			describe('with respect to the active window', function () {
				browserUtils.execute(function getOriginalMarker () {
					return window.getActiveContentWindow().hello;
				});
				it('does not reload the second team\'s page', function () {
					expect(this.result).to.equal('world');
				});
			});

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
