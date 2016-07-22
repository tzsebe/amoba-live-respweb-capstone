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

function userStatus(title, imgBasename) {
    return {
        title: title,
        imgBasename: imgBasename
    };
}

Template.registerHelper("getUserStatus", function(user) {
    if (user) {
        if (user.profile.invitation_token.current_game) {
            return userStatus("Playing a Game", "busy.png");
        }
        if (user.status && user.status.online) {
            return userStatus("Available", "available.png");
        }
    }

    return userStatus("Offline", "offline.png");
});

hasActiveGame = function(user) {
    return (user && user.profile.invitation_token.current_game);
}

Template.registerHelper("hasActiveGame", function(user) {
    return hasActiveGame(user);
});

Template.registerHelper("cellContent", function(content, isWinningCell) {
    switch (content) {
        case 1: return isWinningCell ? "red_wins_500x500.png" : "red_500x500.png";
        case 2: return isWinningCell ? "blue_wins_500x500.png" : "blue_500x500.png";
        default: return "white_500x500.png";
    }
});

Template.registerHelper("filterButtonState", function(filterName, allowOffline) {
    if (!Meteor.user() && allowOffline != true) {
        return "disabled";
    } else if (Session.get(filterName)) {
        return "active";
    } else {
        return "";
    }
});
