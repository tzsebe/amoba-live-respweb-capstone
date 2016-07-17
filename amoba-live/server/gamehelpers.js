//
// Helpers for server-level manipulation of entities.
//

resetPlayersWithWinner = function(game, winningPlayerId, losingPlayerId) {
    // Get the new scores
    console.log("Looking up scores...");
    newScores = calculateNewScores(
        Meteor.users.findOne({_id: winningPlayerId}).profile.score,
        Meteor.users.findOne({_id: losingPlayerId}).profile.score
    );
    console.log("New scores: ", newScores);

    recordAndResetUser(winningPlayerId, true, newScores.winnerScore);
    recordAndResetUser(losingPlayerId, false, newScores.loserScore);
}

resetPlayersNoWinner = function(game) {
    recordAndResetUser(game.player1Id, false, null);
    recordAndResetUser(game.player2Id, false, null);
}

function resetUserToken(userId) {
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
    console.log("Old scores: winner = " + winnerScore + ", loser = " + loserScore);

    // TODO: come up with a better way to set the stakes.
    return {
        winnerScore: winnerScore + 50,
        loserScore: loserScore - 50
    };
}

