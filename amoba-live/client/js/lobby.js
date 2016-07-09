//
// Template helpers for lobby
//

Template.lobby.helpers({
    profile: function() {
        if (Meteor.user()) {
            return Meteor.user().profile;
        } else {
            return null;
        }
    }
});

Template.browse_users.helpers({
    users: function() {
        // TODO: pagination and filtering
        return Meteor.users.find({}, {sort: {'profile.username': 1}});
    }
});

Template.browse_users.events({
    'click .js-browse-user': function(event) {
        if (Meteor.user()) {
            // Set the data context for the modal, which will be the user for
            // the template we clicked in.
            Session.set('browse-user', this);
        }
    }
});

/**
 * This is a reactive pass-through to reactively pass a user object
 * to the modal content template, thereby allowing us to re-use the user
 * profile component here.
 */
Template.user_popup_content_adapter.helpers({
    userFromSession: function() {
        return Session.get('browse-user');
    }
});

Template.user_popup_content.events({
    'click .js-challenge-user': function(event) {
        console.log("Challenging " + this._id);
        Meteor.call('challengeUser', this, function(err, result) {
            if (err) {
                console.log("Error occurred while challenging user:", err);
            } else if (result) {
                console.log("Success!", result);
                $('#user-popup').modal('hide');
            }
        });
    }
});

Template.invitation_details.helpers({
    activeOutgoingInvitation: function() {
        if (Meteor.user() && Meteor.user().profile.invitation_token) {
            var token = Meteor.user().profile.invitation_token;
            if (token.user_id && token.expiration_date && token.expiration_date > new Date()) {
                return token;
            }
        }

        return null;
    },
    activeIncomingInvitations: function() {
        if (Meteor.user()) {
            return Meteor.users.find({
                "profile.invitation_token.user_id": Meteor.user()._id,
                "profile.invitation_token.expiration_date": {$gt: new Date()}
            });
        }

        return null;
    }
});
