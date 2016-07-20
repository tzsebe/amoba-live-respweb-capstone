//
// Template helpers and events for leader board.
//

var LEADERBOARD_SKIPPED_RESULTS_KEY = 'leaderboard-skipped-results';

Template.leaderboard.onRendered(function() {
    if (Session.get(LEADERBOARD_SKIPPED_RESULTS_KEY) == null) {
        Session.set(LEADERBOARD_SKIPPED_RESULTS_KEY, 0);
    }

    Session.set('leaderboard-page-size', GAME_LOG_PAGE_SIZE);
});

Template.leaderboard.helpers({
    userData: function() {
        var usersCursor = Meteor.users.find({}, {
            sort: {"profile.score": -1, "profile.wins": -1},
            limit: LEADERBOARD_PAGE_SIZE+1,
            skip: Session.get(LEADERBOARD_SKIPPED_RESULTS_KEY)
        });

        return {
            users: usersCursor,
            hasPrev: Session.get(LEADERBOARD_SKIPPED_RESULTS_KEY),
            hasNext: usersCursor.count() > LEADERBOARD_PAGE_SIZE
        };
    }
});

Template.leaderboard.events({
    "click #leaderboard-prev-button": function(event) {
        var skip = Session.get(LEADERBOARD_SKIPPED_RESULTS_KEY);
        Session.set(LEADERBOARD_SKIPPED_RESULTS_KEY, skip > LEADERBOARD_PAGE_SIZE ? skip - LEADERBOARD_PAGE_SIZE : 0);
    },

    "click #leaderboard-next-button": function(event) {
        var skip = Session.get(LEADERBOARD_SKIPPED_RESULTS_KEY);
        Session.set(LEADERBOARD_SKIPPED_RESULTS_KEY, skip + LEADERBOARD_PAGE_SIZE);
    }
});
