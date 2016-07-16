//
// This is where we handle the timeout logic that forces
// games to close when a user times out.
//

function timeoutGame(game) {
    // The player that made the last move is the winner. Even moves means player 2 played last.
    var winningPlayerId = game.moves.length % 2 == 0 ? game.player2Id : game.player1Id;
    var losingPlayerId = game.moves.length % 2 == 0 ? game.player1Id : game.player2Id;

    var outcome = winningPlayerId == game.player1Id ? 'player1_win' : 'player2_win';

    // Close out the game...
    Games.update(game._id, {
        $set: {
            winningPlayerId: winningPlayerId,
            outcome: outcome,
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
        if (game.moves.length > numMovesLastSeen) {
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

registerMoveClock = function(gameId, numMovesLastSeen) {
    console.log("Registering move for game " + gameId + ", numMovesLastSeen " + numMovesLastSeen + "...");
    Meteor.setTimeout(function() {
        handleMoveTimeout(gameId, numMovesLastSeen);
    }, 1000 * MOVE_TIME_LIMIT_SECONDS);
}

