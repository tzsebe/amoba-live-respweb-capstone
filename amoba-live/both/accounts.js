/**
 * All accounts and accounts-ui related stuff
 * goes into this file, client and server alike.
 */


if (Meteor.isClient) {
    /**
     * Client-side (ui) account-creation stuff.
     */
    Accounts.ui.config({
        passwordSignupFields: "USERNAME_AND_EMAIL"
    });
}

function getAvatarPic(str) {
    var hash = 0;

    if (str) {
        for (var i = 0; i < str.length; ++i) {
            hash += str.charCodeAt(i);
        }
    }

    return "avatar-" + hash % 50 + ".jpg";
}

if (Meteor.isServer) {
    /**
     * Server-side account-creation stuff.
     */
    Accounts.onCreateUser(function(options,user) {
        user.profile = {
            username: options.username,
            avatar: getAvatarPic(options.username),
            score: 1000,
            invitation_token: {
                test: "making sure this is visible."
            }
        };
        return user;
    });
}
