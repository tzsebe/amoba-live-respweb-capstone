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

Template.game_details.onRendered(function() {
    $("#comments-link").click(function() {
        $('html, body').stop().animate({
            // Subtracting 60 because of fixed nav bar offset.
            scrollTop: $('#comments-section').offset().top - 60
        }, 1000);
    });
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
            result.start_date = game.creationDate;
            result.current_player_turn = false;

            // Figure out game status
            if (game.outcome) {
                result.in_progress = false;
                result.end_date = game.endDate;
                result.outcome = game.outcome;
                result.num_moves = game.moves.length;

                if (game.outcome == 'complete' || game.outcome == 'default') {
                    result.winner_id = game.winningPlayerId;
                    result.loser_id = game.player1Id == game.winningPlayerId ? game.player2Id : game.player1Id;
                }
            } else {
                result.in_progress = true;
                result.current_player_id = game.moves.length % 2 == 0 ? game.player1Id : game.player2Id;
                result.current_player_turn = Meteor.user() && Meteor.user()._id == result.current_player_id;
                if (game.moves.length >= 2) {
                    result.move_timeout_date = getMoveTimeoutDate(game);
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
                    isPlayerTurn: !game.outcome && Meteor.user() && nextPlayerTurnId == Meteor.user()._id,
                    isWinningCell: false
                });
            }

            // Populate cells with game moves, while replaying the game behind the scenes.
            var engine = new AmobaEngine(w, h);
            for (var idx = 0; idx < numMoves; ++idx) {
                var move = game.moves[idx];
                var playerTurn = idx % 2 + 1;
                var cellIdx = move.y * w + move.x;

                cells[cellIdx].x = move.x;
                cells[cellIdx].y = move.y;
                cells[cellIdx].content = playerTurn;
                cells[cellIdx].isPlayerTurn = false; // already-played cells should not be clickable.

                // Replay the game so far internally
                try {
                    engine.addMove(playerTurn, move.x, move.y);
                } catch (ex) {
                    console.log("Caught " + ex.name + ": " + ex.message);
                }
            }

            // If the game is fully over, mark 5 winning cells for display.
            var gameState = engine.getState();
            if (gameState.winning_coords) {
                for (var idx = 0; idx < gameState.winning_coords.length; ++idx) {
                    var x = gameState.winning_coords[idx].x;
                    var y = gameState.winning_coords[idx].y;

                    var cellIdx = y * w + x;
                    cells[cellIdx].isWinningCell = true;
                }
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

Template.comments.helpers({
    /**
     * This is a simple lookup of comments for the game in question.
     */
    comments: function() {
        var game = this;

        if (game && game._id) {
            return Comments.find({gameId: game._id},
                                 {sort: {creationDate: -1}});
        }

        return null;
    }
});

Template.comments_form.events({
    "submit .js-comment-form": function(event) {
        if (Meteor.user() && event.target.form_comment_text.value.trim()) {
            var gameId = this._id;
            var text = event.target.form_comment_text.value.trim();

            // Disable the button before inserting into the collection.
            $('#form_comment_submit_button').prop("disabled", true);

            Meteor.call('addComment', gameId, text, function(err) {
                // Display error if any
                if (err) {
                    handleMeteorException(err);
                } else {
                    // Clear form input
                    $("#form_comment_text").val("");
                }

                // Re-enable the post button
                $("#form_comment_submit_button").prop("disabled", false);
            });
        }

        return false;
    }
});
