/**
 * Games: The main entity in the app. A game is a set of moves between two players,
 *        representing an end-to-end game of Amoba.
 */
Games = new Mongo.Collection("games");

/**
 * - Status
 * - Player 1 ID
 * - Player 2 ID
 * - Date started
 * - Date ended
 * - Last move timestamp
 * - Moves (x, y pairs)
 * - result
 * - TODO: num likes
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
    startDate: {
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
    result: {
        type: String,
        optional: true,
        allowedValues: ['player1_win', 'player2_win', 'draw']
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
