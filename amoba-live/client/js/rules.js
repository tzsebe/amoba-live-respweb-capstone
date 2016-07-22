//
// Template helpers for rules.
//

/**
 * This is a static content page, so all we're doing here is passing on
 * some constants, which are used in the display of the static content.
 */
Template.rules.helpers({
    moveTimeLimitSeconds: MOVE_TIME_LIMIT_SECONDS,
    abandonedTimeLimitMinutes: ABANDONED_TIME_LIMIT_SECONDS/60,
    invitationTimeoutMinutes: INVITATION_TIMEOUT_SECONDS/60
});
