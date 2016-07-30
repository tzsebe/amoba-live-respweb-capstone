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


// How long a game has to be idle to be considered abandoned.
ABANDONED_TIME_LIMIT_SECONDS = 300;

// Interval the abandoned reaper runs on.
ABANDONED_REAPER_INTERVAL_SECONDS = 60;

// Default width and height of the play grid. These get passed on to the
// games, so this constant is only needed when it first creates games. This
// way, potentially, we can do games of differing dimensions, and it would support
// them seamlessly.
GRID_WIDTH = 20;
GRID_HEIGHT = 16;

// Page sizes for paginated displays.
GAME_LOG_PAGE_SIZE = 15;
LEADERBOARD_PAGE_SIZE = 15;
LOBBY_USERS_PAGE_SIZE = 15;

// Session key for reactive time
CURRENT_TIME_SESSION_KEY = 'reactive-current-time';

// Match users operations
MATCH_USERS_CHALLENGE_OP = 'match-users-challenge';
MATCH_USERS_REMOVE_OP = 'match-users-remove';
