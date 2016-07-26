//
// Navbar javascript helpers.
//

var sessionTimerInterval = null;
Template.navbar.onDestroyed(function() {
    if (sessionTimerInterval) {
        Meteor.clearInterval(sessionTimerInterval);
        sessionTimerInterval = null;
    }
});

Template.navbar.onRendered(function() {
    if (sessionTimerInterval) {
        Meteor.clearInterval(sessionTimerInterval);
    }

    sessionTimerInterval = Meteor.setInterval(function() {
        Session.set(CURRENT_TIME_SESSION_KEY, new Date());
    }, 5000);
});
