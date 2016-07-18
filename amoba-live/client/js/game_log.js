//
// Template helpers for game_log
//

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

        return {
            games: Games.find(filters, {sort: {creationDate: -1}})
        }
    }
});

Template.game_log.events({
    "click .js-game-log-filter": function(event) {
        var filterName = $(event.target).data("filtername");
        if (Meteor.user()) {
            Session.set(filterName, !Session.get(filterName));
        }
    }
});
