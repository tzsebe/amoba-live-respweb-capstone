//
// This is where we handle the timeout logic that forces
// games to close when a user times out.
//

function timeoutGame(game) {
    // The player that made the last move is the winner. Even moves means player 2 played last.
    var winningPlayerId = game.moves.length % 2 == 0 ? game.player2Id : game.player1Id;
    var losingPlayerId = game.moves.length % 2 == 0 ? game.player1Id : game.player2Id;

    // Close out the game...
    Games.update(game._id, {
        $set: {
            winningPlayerId: winningPlayerId,
            outcome: 'default',
            endDate: new Date()
        }
    });

    // Close out the users and scores.
    resetPlayersWithWinner(game, winningPlayerId, losingPlayerId);
}

function handleMoveTimeout(gameId, numMovesLastSeen) {
    console.log("Reaping for game " + gameId + ", with numMovesLastSeen " + numMovesLastSeen);

    var game = Games.findOne({_id: gameId});
    if (game) {
        if (game.moves.length < 2) {
            console.log("Not enough moves to qualify for reaping.");
        } else if (game.moves.length > numMovesLastSeen) {
            console.log("Number of moves exceeds last seen - move was made in time.");
        } else if (game.moves.length < numMovesLastSeen) {
            console.log("We only have " + game.moves.length + " moves, which is odd. Ignoring.");
        } else {
            var moveTimeoutDate = getMoveTimeoutDate(game);
            if (new Date() > moveTimeoutDate) {
                // We know we've got an expired move, and the game needs to be shut down.
                timeoutGame(game);
            } else {
                console.log("This move hasn't expired yet.");
            }
        }
    } else {
        console.log("REAPER_ERROR: Could not find game with ID " + gameId + " somehow...");
    }
}


var openGames = [];
function closeAbandonedGames() {
    console.log("Closing abandoned games, if any.");
    console.log("Number of open games (start): " + openGames.length);
    for (var idx = openGames.length-1; idx >= 0; --idx) {
        var gameId = openGames[idx];
        console.log("Looking at gameId " + gameId);
        var game = Games.findOne({_id: gameId});
        var finished = false;
        if (game) {
            if (game.outcome) {
                // Game already closed on its own, no need to keep tracking it.
                finished = true;
                console.log("Game is already done. Ignoring.");
            } else {
                // Check if it's been idling
                var lastActivityDate = game.moves.length > 0 ? game.moves[game.moves.length-1].moveDate : game.creationDate;
                var expirationDate = new Date(lastActivityDate.getTime() + 1000 * ABANDONED_TIME_LIMIT_SECONDS);
                console.log("Last game activity: " + lastActivityDate);
                console.log("Game expiration date: " + expirationDate);
                if (new Date() > expirationDate) {
                    console.log("Game is expired. Closing it.");

                    Games.update(game._id, {
                        $set: {
                            outcome: 'abandoned',
                            endDate: new Date()
                        }
                    });
                    resetPlayersNoWinner(game);

                    finished = true;
                }
            }
        }

        if (finished) {
            console.log("Removing this game id...");
            openGames.splice(idx, 1);
        }
    }
    console.log("Number of open games (end): " + openGames.length);
}

registerMoveClock = function(gameId, numMovesLastSeen) {
    console.log("Registering move for game " + gameId + ", numMovesLastSeen " + numMovesLastSeen + "...");
    Meteor.setTimeout(function() {
        handleMoveTimeout(gameId, numMovesLastSeen);
    }, 1000 * MOVE_TIME_LIMIT_SECONDS);
}

registerOpenGame = function(gameId) {
    openGames.push(gameId);
}

startAbandonedGameClock = function() {
    console.log("Registering abandoned game reaper.");
    closeAbandonedGames();
    Meteor.setInterval(function() {
        closeAbandonedGames();
    }, 1000 * ABANDONED_REAPER_INTERVAL_SECONDS);
}
