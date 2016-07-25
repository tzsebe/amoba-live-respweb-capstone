//
// Template helpers for game_log
//

var GAME_LOG_SKIPPED_RESULTS_KEY = 'game-log-skipped-results';
var GAME_LOG_USER_PREFIX_FILTER_KEY = 'game-log-user-prefix-filter';

Template.game_history.onRendered(function() {
    // Don't lose our display of the filter we typed in.
    if (Session.get(GAME_LOG_USER_PREFIX_FILTER_KEY)) {
        $("#game-log-user-prefix-filter").val(Session.get(GAME_LOG_USER_PREFIX_FILTER_KEY));
    }

    if (Session.get(GAME_LOG_SKIPPED_RESULTS_KEY) == null) {
        Session.set(GAME_LOG_SKIPPED_RESULTS_KEY, 0);
    }

    Session.set('game-log-page-size', GAME_LOG_PAGE_SIZE);
});

Template.game_history.helpers({
    gameData: function() {
        var filterList = [];

        if (Session.get('game-log-active-games-filter')) {
            filterList.push({
                outcome: null
            });
        }

        if (Session.get(GAME_LOG_USER_PREFIX_FILTER_KEY)) {
            var userMatches = Meteor.users.find({
                'profile.username': new RegExp("^" + Session.get(GAME_LOG_USER_PREFIX_FILTER_KEY) + ".*")
            }, {
                fields: {_id: 1}
            }).map(function(user) { return user._id; });

            filterList.push({
                $or: [
                    {player1Id: {$in: userMatches}},
                    {player2Id: {$in: userMatches}}
                ]
            });
        }

        if (Meteor.user()) {

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

var typingTimerHandle = null;
Template.game_log.events({
    "click .js-game-log-filter": function(event) {
        var filterName = $(event.target).data("filtername");
        Session.set(filterName, !Session.get(filterName));

        // Reset pagination
        Session.set(GAME_LOG_SKIPPED_RESULTS_KEY, 0);
    },

    'keyup #game-log-user-prefix-filter': function(event) {
        // Add a debounce, so we can get the event only after the user stops typing.
        if (typingTimerHandle) {
            clearTimeout(typingTimerHandle);
        }

        typingTimerHandle = setTimeout(function() {
            var val = $("#game-log-user-prefix-filter").val().trim();
            if (!val) {
                Session.set(GAME_LOG_USER_PREFIX_FILTER_KEY, null);
            } else {
                Session.set(GAME_LOG_USER_PREFIX_FILTER_KEY, val);
            }

            // Reset pagination
            Session.set(GAME_LOG_SKIPPED_RESULTS_KEY, 0);
        }, 500);
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
