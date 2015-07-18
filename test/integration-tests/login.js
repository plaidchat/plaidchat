// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');

// Start our tests
describe('A fresh plaidchat client', function () {
	browserUtils.openPlaidchat();
	browserUtils.execute(function getActiveContentWindowText () {
		return window.getActiveContentWindow().document.body.textContent;
	});

	it('arrives at a login screen', function () {
		var iframeText = this.result;
		expect(iframeText).to.contain('Mock sign in page');
	});

	describe('upon successful login', function () {
		browserUtils.execute(function loginToTeam () {
			return window.getActiveContentWindow().signInToTeam('plaidchat1');
		});
		browserUtils.execute(function getActiveContentWindowLocation () {
			return window.getActiveContentWindow().location.href;
		});

		it('navigates to our team page', function () {
			expect(this.result).to.match(/team.html\?plaidchat1$/);
		});

		describe('with respect to the sidebar', function () {
			browserUtils.execute(function getActiveContentWindowLocation () {
				var sidebar = document.getElementsByClassName('team-sidebar')[0];
				return sidebar.classList;
			});

			it('has no sidebar', function () {
				expect(this.result).to.contain('hidden');
			});
		});
	});
});

describe('A plaidchat client signed in to 1 team', function () {
	browserUtils.openPlaidchat();
	browserUtils.execute(function loginToTeam () {
		return window.getActiveContentWindow().signInToTeam('plaidchat1');
	});

	describe('logging into another team via the "Sign in to another team..." link', function () {
		before(function waitForReactToProcessEvents (done) {
			setTimeout(done, 100);
		});
		browserUtils.execute(function navigateToSignInPage () {
			return window.getActiveContentWindow().document.getElementById('signin-link').click();
		});

		describe('with respect to the active window', function () {
			browserUtils.execute(function getActiveContentWindowText () {
				return window.getActiveContentWindow().document.body.textContent;
			});

			it('is pointing to the sign in page', function () {
				var iframeText = this.result;
				expect(iframeText).to.contain('Mock sign in page');
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

		describe('with respect to hidden windows', function () {
			browserUtils.execute(function getHiddenWindowLocations () {
				return window.getHiddenWindowLocations();
			});

			it('the `plaidchat1` team exists but is not visible', function () {
				expect(this.result).to.have.length(1);
				expect(this.result[0]).to.match(/team.html\?plaidchat1$/);
			});
		});

		describe('upon succesful sign in to another team', function () {
			browserUtils.execute(function loginToTeam () {
				return window.getActiveContentWindow().signInToTeams([/* active: */ 'plaidchat2', /* inactive: */ 'plaidchat1']);
			});

			describe('with respect to the active window', function () {
				browserUtils.execute(function getActiveContentWindowLocation () {
					return window.getActiveContentWindow().location.href;
				});

				it('is showing the new team', function () {
					expect(this.result).to.match(/team.html\?plaidchat2/);
				});
			});

			describe('with respect to the sidebar', function () {
				browserUtils.execute(function getSidebarInfo () {
					var sidebar = document.getElementsByClassName('team-sidebar')[0];
					return {
						sidebarClassList: sidebar.classList,
						iconSrcArr: [].map.call(sidebar.getElementsByTagName('img'), function getSrc (imgEl) {
							return imgEl.src;
						}),
						rowClassListArr: [].map.call(sidebar.querySelectorAll('.team-sidebar__row'), function getClassList (rowEl) {
							return rowEl.classList;
						})
					};
				});

				it('is visible', function () {
					expect(this.result.sidebarClassList).to.not.contain('hidden');
				});

				it('shows both teams', function () {
					expect(this.result.iconSrcArr).to.deep.equal([
						'http://lorempixel.com/44/44/abstract/1/?plaidchat1',
						'http://lorempixel.com/44/44/abstract/1/?plaidchat2'
					]);
				});

				// TODO: Relocate to sidebar specific tests
				it('marks the second team as active', function () {
					expect(this.result.rowClassListArr[0]).to.not.contain('team-sidebar__row--active');
					expect(this.result.rowClassListArr[1]).to.contain('team-sidebar__row--active');
				});
			});
		});
	});
});
