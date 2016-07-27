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

hasActiveGame = function() {
    return (Meteor.user() && Meteor.user().profile.invitation_token.current_game);
}

hasIncomingChallenge = function() {
    if (Meteor.user() && Session.get(CURRENT_TIME_SESSION_KEY)) {
        return Meteor.users.find({
            "profile.invitation_token.user_id": Meteor.user()._id,
            "profile.invitation_token.expiration_date": {$gt: Session.get(CURRENT_TIME_SESSION_KEY)}
        }).count() > 0;
    }

    return false;
}

Template.registerHelper("hasActiveGame", function() {
    return hasActiveGame();
});

Template.registerHelper("hasIncomingChallenge", function() {
    return hasIncomingChallenge();
});

Template.registerHelper("gameStatusHeading", function(gameStatus) {
    if (gameStatus.in_progress) {
        return "Game in progress!";
    } else if (gameStatus.outcome == 'abandoned') {
        return "Game was abandoned.";
    } else if (gameStatus.outcome == 'draw') {
        return "Game was a draw!";
    } else if (gameStatus.outcome == 'complete' || gameStatus.outcome == 'default') {
        // Someone won...
        if (Meteor.user() && Meteor.user()._id == gameStatus.winner_id) {
            return "You won!";
        } else if (Meteor.user() && Meteor.user()._id == gameStatus.loser_id) {
            return "You lost!";
        } else {
            return Meteor.users.findOne({_id: gameStatus.winner_id}).profile.username + " won!";
        }
    } else {
        return "Game status is unknown!";
    }
});

Template.registerHelper("gameStatusDetails", function(gameStatus) {
    if (gameStatus.in_progress) {
        if (Meteor.user() && Meteor.user()._id == gameStatus.current_player_id) {
            return "It's your turn";
        } else {
            return "It's " + Meteor.users.findOne({_id: gameStatus.current_player_id}).profile.username + "'s turn";
        }
    } else if (gameStatus.winner_id) {
        if (gameStatus.outcome == 'complete') {
            return "Victory after " + gameStatus.num_moves + " moves.";
        } else if (gameStatus.outcome == 'default') {
            return "Victory by default - losing player waited too long.";
        }
    }

    return "";
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
