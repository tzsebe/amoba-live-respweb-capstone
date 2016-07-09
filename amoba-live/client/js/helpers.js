//
// Helpers anyone can use.
//

Template.registerHelper("getUserName", function(userId) {
    if (userId && Meteor.users.findOne({_id: userId})) {
        return Meteor.users.findOne({_id: userId}).profile.username;
    }

    return null;
});

Template.registerHelper("isMyUser", function(user) {
    return (user && Meteor.user() && user._id == Meteor.user()._id);
});

Template.registerHelper("displayOnlineStatus", function(status) {
    if (status && status.online) {
        return "online";
    }

    return "offline";
});
