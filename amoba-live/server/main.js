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

/**
 * Publich all game data.
 */
Meteor.publish('game-data', function() {
    return Games.find();
});

/**
 * Publish all comment data.
 */
Meteor.publish('comment-data', function() {
    return Comments.find();
});
