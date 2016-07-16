//
// Template helpers for game
//

var moveTimerInterval = null;
Template.game_status.onDestroyed(function() {
    if (moveTimerInterval) {
        clearInterval(moveTimerInterval);
        moveTimerInterval = null;
    }
});

Template.game_status.onRendered(function() {
    if (moveTimerInterval) {
        clearInterval(moveTimerInterval);
    }

    moveTimerInterval = setInterval(function() {
        $('#move-timer').each(function() {
            // can't use .data() here, because jQuery doesn't update it dynamically :-(
            var exp = $(this).attr('data-expiration')
            var now = new Date().getTime();
            if (now >= exp) {
                $(this).text("expired");
            } else {
                var diff = Math.floor((exp - now)/1000);
                $(this).text(diff);
            }
        });
    }, 1000);
});

Template.game_details.helpers({
    game: function() {
        return this;
    },
    /**
     * Basic profile-level information about the players
     * playing in this current game.
     *
     * So, just look up the users and do what we want with it in the UI.
     */
    playerInfo: function() {
        var game = this;

        if (game) {
            return {
                player1: Meteor.users.findOne({_id: game.player1Id}),
                player2: Meteor.users.findOne({_id: game.player2Id})
            };
        }

        return null;
    },
    /**
     * Status of the current game in progress. Whose turn it is, whether the game is won, etc.
     *
     * Construct a response based on the game object.
     */
    gameStatus: function() {
        var game = this;
        var result = {};

        if (game && game._id) {
            var player1 = Meteor.users.findOne({_id: game.player1Id});
            var player2 = Meteor.users.findOne({_id: game.player2Id});

            // Figure out player names
            var player1Name = player1.profile.username;
            var player2Name = player2.profile.username;

            result.need_timer = false;

            // Figure out game status
            if (game.outcome) {
                result.in_progress = false;
                result.end_date = game.endDate;

                if (game.outcome == 'draw') {
                    result.status = "Game is a draw";
                } else if (game.outcome == 'abandoned') {
                    result.status = "Game has been abandoned";
                } else {
                    var winningPlayer = Meteor.users.findOne({_id: game.winningPlayerId});
                    if (Meteor.user() && (Meteor.user()._id == game.player1Id || Meteor.user()._id == game.player2Id)) {
                        if (Meteor.user()._id == winningPlayer._id) {
                            result.status = "You win";
                        } else {
                            result.status = "You lose";
                        }
                    } else {
                        result.status = winningPlayer.profile.username + " wins";
                    }
                }
            } else {
                result.in_progress = true;
                var nextPlayerId = game.moves.length % 2 == 0 ? game.player1Id : game.player2Id;
                var nextPlayer = Meteor.users.findOne({_id: nextPlayerId});
                if (Meteor.user() && nextPlayerId == Meteor.user()._id) {
                    result.status = "It's your turn";
                    if (game.moves.length >= 2) {
                        result.need_timer = true;
                        result.move_timeout_date = new Date(game.moves[game.moves.length-1].moveDate.getTime() + 1000 * MOVE_TIME_LIMIT_SECONDS);
                    }
                } else {
                    result.status = "It's " + nextPlayer.profile.username + "'s turn";
                }
            }

        }

        return result;
    },

    /**
     * This is the status of all the cells. The grid cells are ordered by row, and the
     * grid display is handled with judicious width setting, combined with float left.
     */
    cells: function() {
        var game = this;

        if (game && game._id) {
            var w = game.gridWidth;
            var h = game.gridHeight;
            var numMoves = game.moves.length;
            var nextPlayerTurnId = numMoves % 2 == 0 ? game.player1Id : game.player2Id;
            var cellWidthStyle = 100/w + '%';

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
                    isPlayerTurn: !game.outcome && Meteor.user() && nextPlayerTurnId == Meteor.user()._id
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
                cells[cellIdx].isPlayerTurn = false; // already-played cells should not be clickable.
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
