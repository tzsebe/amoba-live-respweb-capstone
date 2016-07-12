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

    }
});
