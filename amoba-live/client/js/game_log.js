//
// Template helpers for game_log
//

var GAME_LOG_SKIPPED_RESULTS_KEY = 'game-log-skipped-results';

Template.game_history.onRendered(function() {
    if (Session.get(GAME_LOG_SKIPPED_RESULTS_KEY) == null) {
        Session.set(GAME_LOG_SKIPPED_RESULTS_KEY, 0);
    }

    Session.set('game-log-page-size', GAME_LOG_PAGE_SIZE);
});

Template.game_history.helpers({
    gameData: function() {
        var filterList = [];

        if (Meteor.user()) {
            if (Session.get('game-log-active-games-filter')) {
                filterList.push({
                    outcome: null
                });
            }

            if (Session.get('game-log-your-victories-filter')) {
                filterList.push({
                    winningPlayerId: Meteor.user()._id
                });
            }


            if (Session.get('game-log-your-games-filter')) {
                filterList.push({
                    $or: [
                        {player1Id: Meteor.user()._id},
                        {player2Id: Meteor.user()._id}
                    ]
                });
            }
        }

        var filters = filterList.length > 0 ? {$and: filterList} : {};


        var gamesCursor = Games.find(filters, {
            sort: {creationDate: -1},
            limit: GAME_LOG_PAGE_SIZE+1,
            skip: Session.get(GAME_LOG_SKIPPED_RESULTS_KEY)
        });

        return {
            games: gamesCursor,
            hasPrev: Session.get(GAME_LOG_SKIPPED_RESULTS_KEY) > 0,
            hasNext: gamesCursor.count() > GAME_LOG_PAGE_SIZE
        }
    }
});

Template.game_log.events({
    "click .js-game-log-filter": function(event) {
        var filterName = $(event.target).data("filtername");
        if (Meteor.user()) {
            Session.set(filterName, !Session.get(filterName));

            // Reset pagination
            Session.set(GAME_LOG_SKIPPED_RESULTS_KEY, 0);
        }
    },

    "click #game-log-prev-button": function(event) {
        var skip = Session.get(GAME_LOG_SKIPPED_RESULTS_KEY);
        Session.set(GAME_LOG_SKIPPED_RESULTS_KEY, skip > GAME_LOG_PAGE_SIZE ? skip - GAME_LOG_PAGE_SIZE : 0);
    },

    "click #game-log-next-button": function(event) {
        var skip = Session.get(GAME_LOG_SKIPPED_RESULTS_KEY);
        Session.set(GAME_LOG_SKIPPED_RESULTS_KEY, skip + GAME_LOG_PAGE_SIZE);
    }
});
