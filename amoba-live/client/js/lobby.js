//
// Template helpers for lobby
//

var LOBBY_SKIPPED_RESULTS_KEY = 'lobby-skipped-results';
var LOBBY_USER_PREFIX_FILTER_KEY = 'lobby-user-prefix-filter';

Template.lobby.helpers({
    profile: function() {
        if (Meteor.user()) {
            return Meteor.user().profile;
        } else {
            return null;
        }
    }
});

Template.browse_users.onRendered(function() {
    // Don't lose our display of the filter we typed in.
    if (Meteor.user() && Session.get(LOBBY_USER_PREFIX_FILTER_KEY)) {
        $("#user-prefix-filter").val(Session.get(LOBBY_USER_PREFIX_FILTER_KEY));
    }
});

Template.browse_users.helpers({
    userData: function() {
        var filterList = [];

        if (Meteor.user()) {
            if (Session.get('lobby-online-only-filter')) {
                filterList.push({
                    'status.online': true
                });
            }

            if (Session.get(LOBBY_USER_PREFIX_FILTER_KEY)) {
                filterList.push({
                    'profile.username': new RegExp("^" + Session.get(LOBBY_USER_PREFIX_FILTER_KEY) + ".*")
                });
            }
        }

        var filters = filterList.length > 0 ? {$and: filterList} : {};

        // TODO: pagination
        var usersCursor = Meteor.users.find(filters, {sort: {'profile.username': 1}});

        return {
            users: usersCursor
        };
    }
});

var typingTimerHandle = null;
Template.browse_users.events({
    'click .js-browse-user': function(event) {
        if (Meteor.user()) {
            // Set the data context for the modal, which will be the user for
            // the template we clicked in.
            Session.set('challenge-user-profile', this);
        }
    },

    'click .js-lobby-filter': function(event) {
        var filterName = $(event.target).data("filtername");
        if (Meteor.user()) {
            Session.set(filterName, !Session.get(filterName));

            // Reset pagination
            Session.set(LOBBY_SKIPPED_RESULTS_KEY, 0);
        }
    },

    'keyup #user-prefix-filter': function(event) {
        // Add a debounce, so we can get the event only after the user stops typing.
        if (typingTimerHandle) {
            clearTimeout(typingTimerHandle);
        }

        typingTimerHandle = setTimeout(function() {
            if (Meteor.user()) {
                var val = $("#user-prefix-filter").val().trim();
                if (!val) {
                    Session.set(LOBBY_USER_PREFIX_FILTER_KEY, null);
                } else {
                    Session.set(LOBBY_USER_PREFIX_FILTER_KEY, val);
                }
            }
        }, 500);
    }
});

/**
 * This is a reactive pass-through to reactively pass a user object
 * to the modal content template, thereby allowing us to re-use the user
 * profile component here.
 */
Template.user_popup_content_adapter.helpers({
    userFromSession: function() {
        return Session.get('challenge-user-profile');
    }
});

Template.user_popup_content.events({
    'click .js-match-user': function(event) {
        console.log("Challenging " + this._id);

        // We have to bind the meteor method call to the modal hide like this,
        // to ensure that it always finishes the hide animation before calling it.
        // This is because iron:router redirects (which we use for making matches) don't
        // properly close the dialog.
        //
        // The 'this' we're passing along is the userId of theuser we're trying to match up with.
        $('#user-popup').on('hidden.bs.modal', this, function(event) {
            Meteor.call('matchUsers', event.data, function(err, result) {
                if (err) {
                    handleMeteorException(err);
                }
            });
        }).modal('hide');
    }
});

// Keeping track of the interval, so we ensure we've only got one going, and only
// while we're actually looking at the page and it's relevant.
var invitationExpirationInterval = null;
Template.invitation_details.onDestroyed(function() {
    if (invitationExpirationInterval) {
        clearInterval(invitationExpirationInterval);
        invitationExpirationInterval = null;
    }
});

Template.invitation_details.onRendered(function() {
    if (invitationExpirationInterval) {
        clearInterval(invitationExpirationInterval);
    }

    invitationExpirationInterval = setInterval(function() {
        $('.js-invitation-timer').each(function() {
            // can't use .data() here, because jQuery doesn't update it dynamically :-(
            var exp = $(this).attr('data-expiration');
            var now = new Date().getTime();
            if (now >= exp) {
                $(this).text("expired");
            } else {
                var diff = new Date(exp - now);
                $(this).text(formatMMSS(diff));
            }

        });

    }, 1000);
});

Template.invitation_details.helpers({
    activeOutgoingInvitation: function() {
        if (Meteor.user() && Meteor.user().profile.invitation_token) {
            var token = Meteor.user().profile.invitation_token;
            if (token.user_id && token.expiration_date && token.expiration_date > new Date()) {
                return Meteor.user();
            }
        }

        return null;
    },
    activeIncomingInvitations: function() {
        if (Meteor.user()) {
            return Meteor.users.find({
                "profile.invitation_token.user_id": Meteor.user()._id,
                "profile.invitation_token.expiration_date": {$gt: new Date()}
            },
            {sort: {'profile.username': 1}});
        }

        return null;
    }
});

Template.invitation_details.events({
    'click .js-invitation-item': function(event) {
        if (Meteor.user()) {
            if (this._id == Meteor.user()._id) {
                console.log("Outgoing - look up user from our invitation token.");
                Session.set('challenge-user-profile', Meteor.users.findOne({_id: this.profile.invitation_token.user_id}));
            } else {
                console.log("Incoming - look up id directly.");
                Session.set('challenge-user-profile', this);
            }
        }
    }
});
