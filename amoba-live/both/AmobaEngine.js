/**
 * This is the core of Amoba. It knows the size of the grid, and keeps
 * track of state, including which player's turn it is.
 *
 * It will tell the client when the game is won, by whom, and which n-tuple
 * is the winner.
 *
 * When a move results in bad state (e.g. out of bounds, already-won game, overlapping
 * move, wrong player turn), an error is thrown.
 *
 * NOTE: We're sticking with the old notation, and not venturing into the fancy ES6 class
 *       notation. Who knows if one of the graders is running some old toaster with IE 6
 *       or some crap. :)
 */
AmobaEngine = function(gridWidth, gridHeight) {
    // Validate inputs.
    var MAX_GRID_SIZE = 100;

    if (gridWidth < 1 || gridWidth > MAX_GRID_SIZE) {
        throwInvalidArgument("gridWidth '" + gridWidth + "' is out of the acceptable range of [1, " + MAX_GRID_SIZE + "]");
    }

    if (gridHeight < 1 || gridHeight > MAX_GRID_SIZE) {
        throwInvalidArgument("gridHeight '" + gridHeight + "' is out of the acceptable range of [1, " + MAX_GRID_SIZE + "]");
    }

    // Initialize internals

    // For the grid, we'll stick to the screen coordinate standard that looks like this:
    //
    // (0,0) --------------> (10,0)   x
    //   |
    //   |
    //   |
    //   |
    //   v
    // (0,10)
    // 
    //   y
    //
    // To access: grid[x][y]
    // Values:
    // - 0: Free cell
    // - 1: Player 1 has played here
    // - 2: Player 2 has played here
    var grid = new Array(gridWidth);
    for (var x = 0; x < gridWidth; ++x) {
        grid[x] = new Array(gridHeight);
        for (var y = 0; y < gridHeight; ++y) {
            grid[x][y] = 0;
        }
    }

    // We use the standard of 1 and 2 for players.
    var currentPlayer = 1;
    var gameOver = false;
    var isDraw = false;
    var winningCoords = [];
    var numMoves = 0;
    
    /**
     * Make a move. We strictly enforce player-correctness, along with everything else.
     * Returns: An object with the state of the world, which contains a winner, and
     * if winner is nonzero, a list of coordinates with the winning move.
     *
     * Will throw exceptions for any invalid calls.
     */
    this.addMove = function(player, x, y) {
        // Validate inputs
        if (player != 1 && player != 2) {
            throwInvalidArgument("Player must be 1 or 2 (you passed '" + player + "')");
        }
        if (x < 0 || x >= MAX_GRID_SIZE) {
            throwInvalidArgument("x '" + x + "' is out of the acceptable range of [0, " + (MAX_GRID_SIZE-1) + "]");
        }
        if (y < 0 || y >= MAX_GRID_SIZE) {
            throwInvalidArgument("y '" + y + "' is out of the acceptable range of [0, " + (MAX_GRID_SIZE-1) + "]");
        }
        if (grid[x][y]) {
            throwInvalidArgument("Position (" + x + ", " + y + ") already has been played.");
        }
        if (gameOver) {
            throwInvalidState("Cannot make a move on a game that is over.");
        }
        if (player != currentPlayer) {
            throwInvalidState("Player passed in ('" + player + "') is not the current player ('" + currentPlayer + "').");
        }

        // Update grid
        grid[x][y] = player;
        ++numMoves;

        // check if we've won, or if it's a draw.
        var evalResult = evaluateMove(x, y);
        if (evalResult) {
            console.log("Game over. Player " + currentPlayer + " wins!");
            gameOver = true;
            winningCoords = evalResult;
        } else if (numMoves == gridWidth * gridHeight) {
            console.log("Game ends in a draw.");
            gameOver = true;
            isDraw = true;
        }

        // Update current player
        if (!gameOver) {
            currentPlayer = currentPlayer == 1 ? 2 : 1;
        }

        return {
            is_game_over: gameOver,
            is_draw: isDraw,
            winner: gameOver && !isDraw ? currentPlayer : 0,
            winning_coords: winningCoords
        };
    }

    /**
     * Retrieve state of all occupied cells, and return a bunch of coordinates.
     */
    this.getState = function() {
        var moves = new Array();
        for (var x = 0; x < gridWidth; ++x) {
            for (var y = 0; y < gridHeight; ++y) {
                if (grid[x][y]) {
                    moves.push(new PlayerMove(grid[x][y], x, y));
                }
            }
        }

        return {
            is_game_over: gameOver,
            is_draw: isDraw,
            winner: gameOver && !isDraw ? currentPlayer : 0,
            winning_coords: winningCoords,
            moves: moves
        };
    }

    // Determine if this move is a winning move, and return coordinates of winning line.
    function evaluateMove(x, y) {
        var h = evaluateMoveDir(x, y, 1, 0);
        var v = evaluateMoveDir(x, y, 0, 1);
        var d1 = evaluateMoveDir(x, y, 1, 1);
        var d2 = evaluateMoveDir(x, y, 1, -1);

        if (h) { return h; }
        if (v) { return v; }
        if (d1) { return d1; }
        return d2;
    }

    function evaluateMoveDir(x, y, dx, dy) {
        // Thing to compare it to.
        var token = grid[x][y];

        // Initialize our iteration
        var startx = x; var endx = x;
        var starty = y; var endy = y;
        var dist = 1;
        var canMove = true;

        // Run the iteration
        while (dist < 5 && canMove) {
            //console.log("Iteration - x = " + x + ", y = " + y + ", dx = " + dx + ", dy = " + dy + ", dist = " + dist);
            canMove = false;

            // Move starting position if we can
            if (xInRange(startx-dx) && yInRange(starty-dy) && grid[startx-dx][starty-dy] == token) {
                startx -= dx;
                starty -= dy;
                ++dist;
                canMove = true;
            }

            // Move ending position if we can
            if (xInRange(endx+dx) && yInRange(endy+dy) && grid[endx+dx][endy+dy] == token) {
                endx += dx;
                endy += dy;
                ++dist;
                canMove = true;
            }
        }

        //console.log("Distance after everything: " + dist);

        // Didn't find anything useful.
        if (dist < 5) {
            return null;
        }

        var result = [];
        for (var i = 0; i < 5; ++i) {
            result.push(new PlayerMove(token, startx + i*dx, starty + i*dy));
        }

        return result;
    }

    function xInRange(x) {
        return x >= 0 && x < gridWidth;
    }

    function yInRange(y) {
        return y >= 0 && y < gridHeight;
    }

    // Coordinate type definition
    function PlayerMove(player, x, y) {
        this.player = player;
        this.x = x;
        this.y = y;
    }

    // Exception convenience functions.
    function throwInvalidArgument(msg) { throwError('InvalidArgument', msg); }
    function throwInvalidState(msg) { throwError('InvalidState', msg); }
    function throwError(type, msg) { throw { name: type, message: msg }; }
}


