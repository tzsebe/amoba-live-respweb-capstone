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

handleMeteorException = function(exception) {
    if (exception) {
        var msg = "[" + exception.error + "] - " + exception.reason;
        if (exception.details) {
            msg += ": " + exception.details;
        }

        Alerts.add(msg);
    }
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

function hasValidInvitation(fromUser, toUser) {
    if (fromUser && fromUser.profile.invitation_token && toUser) {
        var fromToken = fromUser.profile.invitation_token;
        return (fromToken.user_id == toUser._id && fromToken.expiration_date > new Date());
    }
}

Template.registerHelper("challengeButtonText", function(user) {
    var hasValidOutgoingInvitation = hasValidInvitation(Meteor.user(), user);
    var hasValidIncomingInvitation = hasValidInvitation(user, Meteor.user());

    if (hasValidOutgoingInvitation) {
        return "Renew Challenge!";
    } else if (hasValidIncomingInvitation) {
        return "Accept Challenge!";
    } else {
        return "Challenge User!";
    }
});

Template.registerHelper("getUserStatus", function(user) {
    if (user) {
        if (user.status.online) {
            return "available";
        }
    }

    return "offline";
});

Template.registerHelper("displayOnlineStatus", function(status) {
    if (status && status.online) {
        return "online";
    }

    return "offline";
});
