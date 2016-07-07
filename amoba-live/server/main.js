//
// Data publications
//

/**
 * Publish user data, including status.
 */
Meteor.publish('user-data', function() {
    return Meteor.users.find(
        {},
        {fields: {profile: 1, status: 1}}
    );
});
