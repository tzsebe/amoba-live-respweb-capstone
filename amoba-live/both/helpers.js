//
// Helpers shared between server and client.
//

getMoveTimeoutDate = function(game) {
    if (!game) {
        return null;
    }

    if (game.moves.length >= 2) {
        return moveTimeoutDate = new Date(game.moves[game.moves.length-1].moveDate.getTime() + 1000 * MOVE_TIME_LIMIT_SECONDS);
    }

    return null;
}
