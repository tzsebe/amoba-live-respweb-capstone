//
// Template helpers for game_log
//

Template.game_history.helpers({
    games: function() {
        return Games.find({}, {sort: {creationDate: -1}});
    }
});
