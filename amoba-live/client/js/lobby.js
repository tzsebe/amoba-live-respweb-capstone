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
