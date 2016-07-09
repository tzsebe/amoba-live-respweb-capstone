//
// Helpers anyone can use.
//

Template.registerHelper("isMyUser", function(user) {
    return (user && Meteor.user() && user._id == Meteor.user()._id);
});

Template.registerHelper("displayOnlineStatus", function(status) {
    if (status && status.online) {
        return "online";
    }

    return "offline";
});
