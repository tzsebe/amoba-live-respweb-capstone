//
// Application-wide constants live here.
//
// File name starts with "00" to ensure it really does load first.
//

// How long an invitation is valid before expiring
INVITATION_TIMEOUT_SECONDS = 300;

// Number of seconds we allow for a player to make a move before declaring
// the game lost.
MOVE_TIME_LIMIT_SECONDS = 30;

// Default width and height of the play grid. These get passed on to the
// games, so this constant is only needed when it first creates games. This
// way, potentially, we can do games of differing dimensions, and it would support
// them seamlessly.
GRID_WIDTH = 20;
GRID_HEIGHT = 16;
