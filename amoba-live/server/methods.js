//
// Meteor Methods. This is the heart of all things.
//
// Keeping this entirely on the server. I don't foresee a need to ever share these.
// I am thinking of this as "service calls", for the lack of a better term.
//

function setCurrentGame(userId, gameId) {
    Meteor.users.update({_id: userId},
        {
            $set: {
                "profile.invitation_token": {
                    current_game: gameId
                }
            }
        }
    );
}

Meteor.methods({
    /**
     * This is the logic that helps match users against one another. When users challenge themselves/accept
     * challenges,this method is called. After a match is made (valid invitation found between two users), a
     * number of things have to happen:
     *
     * 1) All incoming/outgoing invitations from their invitation tokens are expired.
     * 2) A game is created with the two players setup. Which player is "player 1" is randomly assigned.
     * 3) Each player's status is updated with the current game_id (shows as busy).
     *
     * While a game is in progress, going to the lobby immediately redirects a user to the game in progress.
     */
    matchUsers: function(targetUser) {
        // Validate all input
        if (!Meteor.user()) {
            throw new Meteor.Error(400, "You must be logged in to perform this action.");
        }

        if (!targetUser) {
            throw new Meteor.Error(400, "targetUser must be passed in.");
        }

        if (targetUser._id == Meteor.user()._id) {
            throw new Meteor.Error(400, "You cannot challenge yourself.");
        }

        if (Meteor.user().profile.invitation_token.current_game) {
            throw new Meteor.Error(400, "You have a game in progress - complete it first.");
        }

        // First, check for a match, and handle that accordingly.
        var otherUserToken = targetUser.profile.invitation_token;
        if (otherUserToken.user_id == Meteor.user()._id && otherUserToken.expiration_date > new Date()) {
            // We've found a match, so spin up a game!
            console.log("We have a match between user " + Meteor.user().profile.username + " and " + targetUser.profile.username);

            //
            // Create a Game
            //

            // Assign player IDs (with a date-based random element)
            var player1Id = targetUser._id;
            var player2Id = Meteor.user()._id;
            if (new Date().getTime() % 2 == 0) {
                // swap the player IDs 50% of the time... millisecond clock should be enough for this to
                // be random enough.
                var tmp = player1Id;
                player1Id = player2Id;
                player2Id = tmp;
            }

            console.log("Player1 " + player1Id + ", player2 " + player2Id);

            var gameId = Games.insert({
                player1Id: player1Id,
                player2Id: player2Id,
                creationDate: new Date(),
                gridWidth: GRID_WIDTH,
                gridHeight: GRID_HEIGHT,
                moves: []
            });

            console.log("Game response: ", gameId);

            // Kill all existing invitations, and just set the gameId as the new thing.

            setCurrentGame(player1Id, gameId);
            setCurrentGame(player2Id, gameId);

            // Record open game for reaping.
            registerOpenGame(gameId);

            return null;
        } else {
            // Setup the challenge/invitation
            console.log("Challenging user with id " + targetUser._id + ", name " + targetUser.profile.username);
            var challengeDate = new Date();
            var expirationDate = new Date(challengeDate.getTime() + 1000*INVITATION_TIMEOUT_SECONDS);
            var token = {
                user_id: targetUser._id,
                challenge_date: challengeDate,
                expiration_date: expirationDate
            };
            Meteor.users.update(
                {_id: Meteor.user()._id},
                {
                    $set: {
                        "profile.invitation_token": token
                    }
                }
            );

            return token;
        }

    },

    /**
     * This is the main logic that interfaces with the game. A player clicks something to make
     * a move. This method validates the move, updates the game state as necessary, and closes/tallies
     * up the game results as needed.
     *
     * Input:
     * - gameId: ID of game being played
     * - playerId: userId of player making the move
     * - move: Object representing the move being made
     *   - coords: object with an x and a y
     *
     * Validation:
     * - Game:
     *   - Game must still be ongoing/open
     * - Player:
     *   - playerId must match current userId
     *   - it must be playerId's turn
     * - Game Rules:
     *   - Must be a valid move (through reconstructing the state)
     *
     * Output/behavior:
     * - Replay all moves so far
     * - Add the new move
     * - If the game is over:
     *   - Close the game (specify status)
     */
    gameMove: function(gameId, playerId, move) {
        // Degenerate input validation
        if (!gameId) {
            throw new Meteor.Error(400, "Missing gameId.");
        }
        if (!playerId) {
            throw new Meteor.Error(400, "Missing playerId.");
        }
        if (!move) {
            throw new Meteor.Error(400, "Missing move.");
        }

        console.log("Processing move: gameId [" + gameId + "], playerId [" + playerId + "], move: ", move);

        // Basic input validation
        if (!Meteor.user()) {
            throw new Meteor.Error(400, "You must be logged in to perform this action.");
        }
        if (Meteor.user()._id != playerId) {
            throw new Meteor.Error(400, "You are not logged in as the user you claim to be.");
        }
        var game = Games.findOne({_id: gameId});
        if (!game) {
            throw new Meteor.Error(400, "Game does not exit.");
        }
        if (game.endDate) {
            throw new Meteor.Error(400, "Game is already over.");
        }
        if (game.player1Id != playerId && game.player2Id != playerId) {
            throw new Meteor.Error(400, "You are not a player on this game.");
        }

        // Check if it's player's turn
        var playerTurn = game.moves.length % 2 + 1;
        if (playerTurn == 1 && game.player1Id != playerId || playerTurn == 2 && game.player2Id != playerId) {
            throw new Meteor.Error(400, "It's not your turn.");
        }

        // Check if move was passed in.
        if (!move.coords) {
            throw new Meteor.Error(400, "No coordinates passed in.");
        }

        // Check if we're trying to make a move after the expiration timeout.
        if (game.moves.length >= 2) {
            var moveTimeoutDate = getMoveTimeoutDate(game);
            if (new Date() > moveTimeoutDate) {
                throw new Meteor.Error(400, "You waited too long - you lose.");
            }
        }

        // Replay the entire game up until now, to make sure state is good.
        var engine = new AmobaEngine(game.gridWidth, game.gridHeight);

        for (var idx = 0; idx < game.moves.length; ++idx) {
            var internalPlayerId = idx % 2 + 1;
            try {
                var result = engine.addMove(internalPlayerId, game.moves[idx].x, game.moves[idx].y);
                if (result.is_game_over) {
                    throw new Meteor.Error(400, "GAME OVER!!!!");
                }
            } catch (ex) {
                throw new Meteor.Error(400, "Caught " + ex.name + ": " + ex.message);
            }
        }

        // Test the new move on the engine
        var lastMoveResult = null;
        try {
            lastMoveResult = engine.addMove(playerTurn, move.coords.x, move.coords.y);
        } catch (ex) {
            throw new Meteor.Error(400, "Caught " + ex.name + ": " + ex.message);
        }

        // Map everything we need to map from the last move (in particular - if it ended the game).
        var outcome = null;
        var winningPlayerId = null;
        var losingPlayerId = null;
        var endDate = null;
        if (lastMoveResult.is_game_over) {
            if (lastMoveResult.is_draw) {
                // Draw (rare condition)
                outcome = 'draw';
            } else {
                // Someone won
                outcome = 'complete';
                winningPlayerId = lastMoveResult.winner == 1 ? game.player1Id : game.player2Id;
                losingPlayerId = winningPlayerId == game.player1Id ? game.player2Id : game.player1Id;
                endDate = new Date();
            }
        }

        // Update game with latest move.
        Games.update(gameId, {
            $push: {
                moves: {
                    x: move.coords.x,
                    y: move.coords.y,
                    moveDate: new Date()
                }
            },
            $set: {
                winningPlayerId: winningPlayerId,
                outcome: outcome,
                endDate: endDate
            }
        });

        // Update player statuses
        if (outcome && !game.outcome) {
            // In case of a draw, don't change scores
            if (outcome == 'draw') {
                resetPlayersNoWinner(game);
            } else {
                resetPlayersWithWinner(game, winningPlayerId, losingPlayerId);
            }
        }

        // Handle move timeout counters as needed.
        if (!outcome) {
            registerMoveClock(game._id, game.moves.length + 1);
        }
    },

    /**
     * Add a comment to a game.
     */
    addComment: function(gameId, text) {
        // Basic input validation
        if (!gameId) {
            throw new Meteor.Error(400, "Missing gameId");
        }
        if (!text || !text.trim()) {
            throw new Meteor.Error(400, "Missing text");
        }

        // Data validation
        if (!Meteor.user()) {
            throw new Meteor.Error(400, "You are not logged in.");
        }

        if (!Games.findOne({_id: gameId})) {
            throw new Meteor.Error(400, "Game with ID " + gameId + " does not exist.");
        }

        // All looks good, insert our comment.
        Comments.insert({
            gameId: gameId,
            userId: Meteor.user()._id,
            text: text.trim(),
            creationDate: new Date()
        });
    }
});
