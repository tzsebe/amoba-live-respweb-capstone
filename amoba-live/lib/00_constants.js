//
// Application-wide constants live here.
//

// How long an invitation is valid before expiring
INVITATION_TIMEOUT_SECONDS = 300;

// Default width and height of the play grid. These get passed on to the
// games, so this constant is only needed when it first creates games. This
// way, potentially, we can do games of differing dimensions, and it would support
// them seamlessly.
GRID_WIDTH = 20;
GRID_HEIGHT = 16;
