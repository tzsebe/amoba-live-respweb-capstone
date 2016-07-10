//
// Meteor Methods. This is the heart of all things.
//
// Keeping this entirely on the server. I don't foresee a need to ever share these.
// I am thinking of this as "service calls", for the lack of a better term.
//

Meteor.methods({
    matchUsers: function(targetUser) {
        // Validate all input
        if (!Meteor.user()) {
            throw new Meteor.Error(400, "You must be logged in to perform this action.");
        }

        if (!targetUser) {
            throw new Meteor.Error(400, "targetUser must be passed in.");
        }

        if (targetUser._id == Meteor.user()._id) {
            throw new Meteor.Error(400, "You cannot challenge yourself.");
        }

        console.log("Challenging user with id " + targetUser._id + ", name " + targetUser.profile.username);
        var challengeDate = new Date();
        var expirationDate = new Date(challengeDate.getTime() + 1000*INVITATION_TIMEOUT_SECONDS);
        token = {
            user_id: targetUser._id,
            challenge_date: challengeDate,
            expiration_date: expirationDate
        };
        Meteor.users.update(
            {_id: Meteor.user()._id},
            {$set: {
                "profile.invitation_token": token
            }}
        );

        return token;
    }
});
