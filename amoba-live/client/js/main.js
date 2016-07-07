/**
 * Any UI tweaks/look-and-feel adjustments needed once the document loads.
 */

Template.navbar.onRendered(function() {
    // If we're in collapsed mode, also close the menu.
    $('.js-nav-item').click(function() {
        $('.navbar-collapse').collapse('hide');
    });
});
