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
