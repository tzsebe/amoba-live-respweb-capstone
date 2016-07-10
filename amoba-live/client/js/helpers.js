//
// Helpers anyone can use.
//



//
// Common javascript utilities
//

function zeroPadTime(val) {
    if (val < 10) {
        return "0" + val;
    }
    return ""+val;
}

formatMMSS = function(date) {
    return zeroPadTime(date.getMinutes()) + ":" + zeroPadTime(date.getSeconds());
}


//
// Template custom helpers
//

Template.registerHelper("dateToEpoch", function(date) {
    return date.getTime();
});

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
