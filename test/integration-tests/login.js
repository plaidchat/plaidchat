// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');

// Start our tests
describe('A fresh plaidchat client', function () {
	browserUtils.openPlaidchat();
	browserUtils.execute(function getActiveWindowText () {
		return window.getActiveWindow().document.body.textContent;
	});

	it('arrives at a login screen', function () {
		var iframeText = this.result;
		expect(iframeText).to.contain('Mock sign in page');
	});

	describe('upon successful login', function () {
		browserUtils.execute(function loginToTeam () {
			return window.getActiveWindow().signInToTeam('plaidchat1');
		});
		browserUtils.execute(function getActiveWindowLocation () {
			return window.getActiveWindow().location.href;
		});

		it('navigates to our team page', function () {
			expect(this.result).to.match(/team.html\?plaidchat1$/);
		});

		describe('with respect to the sidebar', function () {
			browserUtils.execute(function getActiveWindowLocation () {
				var sidebar = document.getElementsByClassName('team-sidebar')[0];
				return sidebar.classList;
			});

			it('has no sidebar', function () {
				expect(this.result).to.contain('hidden');
			});
		});
	});
});
