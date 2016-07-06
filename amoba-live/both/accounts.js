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

if (Meteor.isServer) {
    /**
     * Server-side account-creation stuff.
     */
    Accounts.onCreateUser(function(options,user) {
        user.profile = {
            username: options.username,
            // TODO: avatar
            score: 1000,
            invitation_token: {
                test: "making sure this is visible."
            }
        };
        return user;
    });
}
