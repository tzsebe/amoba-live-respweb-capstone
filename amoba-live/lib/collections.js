/**
 * Games: The main entity in the app. A game is a set of moves between two players,
 *        representing an end-to-end game of Amoba.
 */
Games = new Mongo.Collection("games");

/**
 * Here's how these fields work:
 *  - player1Id/player2Id: The userId of players in this game
 *  - creationDate: When the game was created.
 *  - lastMoveDate: When the last move was made
 *  - endDate: For an ended game, when it was ended.
 *  - outcome: Outcome of the game:
 *      - one of the players can win (1 or 2)
 *      - it can be a draw if the board was filled with no winner
 *      - it can be abandoned if there are less than 2 total moves, and the game timed out.
 *  - moves: List of coordinates of moves, in order (player 1 goes first, then player 2, and so on).
 */
Games.attachSchema({
    player1Id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    player2Id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    creationDate: {
        type: Date
    },
    lastMoveDate: {
        type: Date,
        optional: true
    },
    endDate: {
        type: Date,
        optional: true
    },
    outcome: {
        type: String,
        optional: true,
        allowedValues: ['player1_win', 'player2_win', 'draw', 'abandoned']
    },
    moves: {
        type: [Object],
        minCount: 0
    },
    'moves.$.x': {
        type: Number
    },
    'moves.$.y': {
        type: Number
    }
});
