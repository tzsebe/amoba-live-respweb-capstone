//
// Template helpers for game
//

Template.game_details.helpers({
    game: function() {
        return Games.findOne({_id: this.gameId});
    },
    cells: function() {
        var game = Games.findOne({_id: this.gameId});

        var cellWidthStyle = 100/GRID_WIDTH + '%';
        if (game && Meteor.user()) {
            var w = game.gridWidth;
            var h = game.gridHeight;
            var numMoves = game.moves.length;
            var nextPlayerTurnId = numMoves % 2 == 0 ? game.player1Id : game.player2Id;

            // Setup empty cells
            var cells = [];
            for (var idx = 0; idx < w*h; ++idx) {
                var x = idx % w;
                var y = Math.floor(idx / w);
                cells.push({
                    gameId: game._id,
                    x: x,
                    y: y,
                    cellWidthStyle: cellWidthStyle,
                    content: 0,
                    isPlayerTurn: nextPlayerTurnId == Meteor.user()._id
                });
            }

            // Populate cells with game moves
            for (var idx = 0; idx < numMoves; ++idx) {
                var move = game.moves[idx];
                var playerTurn = idx % 2 + 1;
                var cellIdx = move.y * game.gridWidth + move.x;

                cells[cellIdx].x = move.x;
                cells[cellIdx].y = move.y;
                cells[cellIdx].content = playerTurn;
            }

            return cells;
        }

        return null;
    }
});

Template.cell_display.events({
    "click .js-clickable-grid-cell": function(event) {
        if (Meteor.user()) {
            var x = this.x;
            var y = this.y;
            var gameId = this.gameId;
            console.log("Clicked (" + x + ", " + y + ") for game " + gameId);

            Meteor.call('gameMove', gameId, Meteor.user()._id, {
                coords: {
                    x: x,
                    y: y
                }
            }, function(err) {
                if (err) {
                    handleMeteorException(err);
                }
            });
        }
    }
});
