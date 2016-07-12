//
// Template helpers for game
//

Template.game_details.helpers({
    game: function() {
        return Games.findOne({_id: this.gameId});
    }
});
