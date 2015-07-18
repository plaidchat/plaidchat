(function () {
	'use strict';
	// Load in our dependencies
	var expect = require('chai').expect;
	var AppDispatcher = require('../../app/dispatchers/app');
	var _TeamStore = require('../../app/stores/team');

	// Fallback console.debug to a noop
	console.debug = function () {};

	// Define test utilities
	var testUtils = {
		session: {
			start: function () {
				before(function localizeTeamStore () {
					this.store = _TeamStore;
				});
				after(function cleanup () {
					_TeamStore.reset();
					delete this.store;
				});
			},
			startWithInitializedStore: function () {
				this.start();
				before(function initializeStore () {
					this.store.init();
				});
			}
		}
	};

	// Define our test cases
	describe('A fresh team store', function () {
		testUtils.session.start();

		it('has no teams', function () {
			var teams = this.store.getTeams();
			expect(teams).to.have.length(0);
		});
	});

	describe.only('An initialized team store', function () {
		testUtils.session.start();
		before(function initializeStore () {
			AppDispatcher.dispatch({
				type: AppDispatcher.ActionTypes.APPLICATION_INIT
			});
		});

		it('has a placeholder team at the login URL', function () {
			var teams = this.store.getTeams();
			expect(teams).to.have.length(1);
			expect(teams[0]).to.have.property('team_id', '_plaidchat-placeholder-0');
			expect(teams[0]).to.have.property('team_url', 'https://slack.com/signin');
		});
	});

	describe('A team store initialized with a given URL', function () {
		testUtils.session.start();
		before(function initializeStoreWithUrl () {
			AppDispatcher.dispatch({
				type: AppDispatcher.ActionTypes.APPLICATION_INIT,
				url: 'https://plaidchat-test.slack.com/'
			});
		});

		it('has a placeholder team at the given URL', function () {
			var teams = this.store.getTeams();
			expect(teams).to.have.length(1);
			expect(teams[0]).to.have.property('team_id', '_plaidchat-placeholder-0');
			expect(teams[0]).to.have.property('team_url', 'https://plaidchat-test.slack.com/');
		});
	});

	describe('An initialized team store', function () {
		testUtils.session.startWithInitializedStore();

		it('marks the placeholder team as the active team', function () {
			var activeTeamId = this.store.getActiveTeamId();
			expect(activeTeamId).to.equal('_plaidchat-placeholder-0');
		});

		it('has a placeholder team at a numerical index', function () {
			var indicies = this.store.getTeamIndicies();
			expect(indicies).to.have.property('_plaidchat-placeholder-0', 0);
		});

		describe('when we log into our placeholder team', function () {
			before(function loginTeam () {
				AppDispatcher.dispatch({
					type: AppDispatcher.ActionTypes.TEAMS_UPDATE,
					alias: {
						srcTeamId: '_plaidchat-placeholder-0',
						targetTeamId: 'U1234'
					},
					allTeams: [{
						team_id: 'U1234',
						team_url: 'https://U1234.slack.com/'
					}]
				});
			});

			it('marks the new team as the active team', function () {
				var activeTeamId = this.store.getActiveTeamId();
				expect(activeTeamId).to.equal('U1234');
			});

			it('has the new team\'s info', function () {
				var teams = this.store.getTeams();
				expect(teams).to.have.length(1);
				expect(teams[0]).to.have.property('team_id', 'U1234');
				expect(teams[0]).to.have.property('team_url', 'https://U1234.slack.com/');
			});

			it('maintains the same numerical index', function () {
				var indicies = this.store.getTeamIndicies();
				expect(indicies).to.have.property('U1234', 0);
			});
		});
	});

	describe.only('An initialized team store', function () {
		testUtils.session.startWithInitializedStore();

		describe('when we log into multiple teams', function () {
			before(function loginTeam () {
				AppDispatcher.dispatch({
					type: AppDispatcher.ActionTypes.TEAMS_UPDATE,
					alias: {
						srcTeamId: '_plaidchat-placeholder-0',
						targetTeamId: 'U1234'
					},
					allTeams: [{
						team_id: 'U1234',
						team_url: 'https://U1234.slack.com/'
					}, {
						team_id: 'U5678',
						team_url: 'https://U5678.slack.com/'
					}]
				});
			});

			it('has the placeholder replacement team as the active team', function () {
				var activeTeamId = this.store.getActiveTeamId();
				expect(activeTeamId).to.equal('U1234');
			});

			it('has multiple team information', function () {
				var teams = this.store.getTeams();
				expect(teams).to.have.length(2);
				expect(teams[0]).to.have.property('team_id', 'U1234');
				expect(teams[1]).to.have.property('team_id', 'U5678');
			});

			it('has a new numerical index for the new team', function () {
				var indicies = this.store.getTeamIndicies();
				expect(indicies).to.have.property('U5678', 1);
			});

			describe('when we log out of the active team', function () {
				before(function loginTeam () {
					AppDispatcher.dispatch({
						type: AppDispatcher.ActionTypes.TEAMS_UPDATE,
						allTeams: [{
							team_id: 'U5678',
							team_url: 'https://U5678.slack.com/'
						}]
					});
				});

				it('has 1 team remaining', function () {
					var teams = this.store.getTeams();
					expect(teams).to.have.length(1);
					expect(teams[0]).to.have.property('team_id', 'U5678');
				});

				it('marks the remaining team as the active team', function () {
					var activeTeamId = this.store.getActiveTeamId();
					expect(activeTeamId).to.equal('U5678');
				});
			});
		});
	});
})();
