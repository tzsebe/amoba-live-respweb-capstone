//
// Data Subscriptions
//

Meteor.subscribe("user-data");
Meteor.subscribe("game-data");
Meteor.subscribe("comment-data");


//
// Overall UI tweaks.
//

/**
 * Javascript handlers to apply to components of the navbar when it's rendered.
 */
Template.navbar.onRendered(function() {
    // If we're in collapsed mode, also close the menu.
    $('.js-nav-item').click(function() {
        $('.navbar-collapse').collapse('hide');
    });
});
