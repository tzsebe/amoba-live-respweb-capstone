/**
 * Games: The main entity in the app. A game is a set of moves between two players,
 *        representing an end-to-end game of Amoba.
 */
Games = new Mongo.Collection("games");

/**
 * Here's how these fields work:
 *  - player1Id/player2Id: The userId of players in this game
 *  - creationDate: When the game was created.
 *  - endDate: For an ended game, when it was ended.
 *  - outcome: Outcome of the game:
 *      - one of the players can win (1 or 2)
 *      - it can be a draw if the board was filled with no winner
 *      - it can be abandoned if there are less than 2 total moves, and the game timed out.
 *  - moves: List of coordinates of moves, in order (player 1 goes first, then player 2, and so on). Also include date.
 *  - gridWidth/gridHeight: Width and height of the playing area for this game.
 *  - winningPlayerId: PlayerID of the winner.
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
    endDate: {
        type: Date,
        optional: true
    },
    outcome: {
        type: String,
        optional: true,
        allowedValues: ['complete', 'default', 'draw', 'abandoned']
    },
    winningPlayerId: {
        type: String,
        optional: true,
        regEx: SimpleSchema.RegEx.Id
    },
    gridWidth: {
        type: Number,
        min: 0,
        max: GRID_WIDTH
    },
    gridHeight: {
        type: Number,
        min: 0,
        max: GRID_HEIGHT
    },
    moves: {
        type: [Object],
        minCount: 0
    },
    'moves.$.x': {
        type: Number,
        min: 0
    },
    'moves.$.y': {
        type: Number,
        min: 0
    },
    'moves.$.moveDate': {
        type: Date,
    }
});

/**
 * Comments: Collection representing comments on a game. A game can have multiple comments
 *           from multiple users, and they have to be ordered by date when querying.
 */
Comments = new Mongo.Collection("comments");

/**
 * Schema for comments:
 * - gameId: game id for game the comment is for
 * - userId: user id of the commenter
 * - text: Contents of the comment. Must not be empty.
 * - creationDate: timestamp when comment was created. Comments are immutable. There is no deleting/editing them.
 */
Comments.attachSchema({
    gameId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    userId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    text: {
        type: String,
        min: 1
    },
    creationDate: {
        type: Date
    }
});
