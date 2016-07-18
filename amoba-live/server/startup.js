/**
 * This runs when the server starts up.
 */
Meteor.startup(function() {
    // No users? Create a bunch!
    if (!Meteor.users.findOne()) {
        console.log("No users exist. Inserting 20 stock users.");

        var userIds = [];

        for (var i = 1; i <= 20; ++i) {
            var username = "user" + i;
            var avatar = "avatar-" + i + ".jpg";

            var userId = Meteor.users.insert({
                profile: {
                    username: username,
                    avatar: avatar,
                    score: 1000,
                    games: 0,
                    wins: 0,
                    invitation_token: {
                        test: "making sure this is visible."
                    }
                },
                username: username,
                services:{
                    // this is 'aaaaaa'
                    password: {"bcrypt" : "$2a$10$yqawdeYfSStoiFXclBk11O4ku26kaZjy49xDJHOW8xisP2QUTZjBy"}
                }
            });

            userIds.push(userId);
        }

        // We can insert a bunch of random games, to test pagination. Remember to
        // remove this before submitting.
        //
        // TODO: comment out!
        insertRandomGames(100, userIds);
    }

    // Collect open games. This is extremely inefficient at scale, and we'd need to find a way
    // to do this with indexes.
    console.log("Collecting previously-opened games...");
    Games.find({outcome: null}).forEach(function(game) {
        registerOpenGame(game._id);
    });

    // Start the abandoned game reaper interval.
    startAbandonedGameClock();
});

function randomN(n) {
    return Math.floor((Math.random() * n));
}

function insertRandomGames(numGames, userIds) {
    console.log("Inserting " + numGames + " games into collection.");
    for (var n = 0; n < numGames; ++n) {
        // Pick two users
        var idx1 = randomN(20);
        var idx2 = (idx1 + randomN(19)) % 20;
        var player1Id = userIds[idx1];
        var player2Id = userIds[idx2];

        // Pick a random start date over the last week
        var startDate = new Date(new Date().getTime() - 1000 * randomN(7*24*3600));

        // Setup game data
        var game = {
            player1Id: player1Id,
            player2Id: player2Id,
            creationDate: startDate,
            gridWidth: 20,
            gridHeight: 16,
            moves: [],
            winningPlayerId: player1Id,
            outcome: 'complete',
            endDate: new Date(startDate.getTime() + 1000*100)
        }

        for (var i = 0; i < 9; ++i) {
            game.moves.push({
                x: (Math.floor(i/2)) + 1,
                y: i % 2 == 0 ? 6 : 7,
                moveDate: new Date(startDate.getTime() + 1000 * (i+1)*10)
            });
        }

        Games.insert(game);
    }
}
