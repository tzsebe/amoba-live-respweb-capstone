//
// Helpers for server-level manipulation of entities.
//

resetPlayersWithWinner = function(game, winningPlayerId, losingPlayerId) {
    // Get the new scores
    newScores = calculateNewScores(
        Meteor.users.findOne({_id: winningPlayerId}).profile.score,
        Meteor.users.findOne({_id: losingPlayerId}).profile.score
    );

    recordAndResetUser(winningPlayerId, true, newScores.winnerScore);
    recordAndResetUser(losingPlayerId, false, newScores.loserScore);
}

resetPlayersNoWinner = function(game) {
    recordAndResetUser(game.player1Id, false, null);
    recordAndResetUser(game.player2Id, false, null);
}

resetUserToken = function(userId) {
    Meteor.users.update({_id: userId}, {
        $set: {
            "profile.invitation_token": {},
        }
    });
}

function recordAndResetUser(userId, win, newScore) {
    var operation = {
        $set: {
            "profile.invitation_token": {},
        },
        $inc: {
            "profile.games": 1,
            "profile.wins": win ? 1 : 0
        }
    };

    if (newScore != null) {
        operation["$set"]["profile.score"] = newScore;
    }

    Meteor.users.update({_id: userId}, operation);
}

calculateNewScores = function(winnerScore, loserScore) {
    // TODO: come up with a better way to set the stakes.
    // TODO: start people off with score of zero, and add the 1000 after the first game.
    return {
        winnerScore: winnerScore + 50,
        loserScore: loserScore - 50
    };
}

