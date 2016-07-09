//
// Helpers anyone can use.
//

Template.registerHelper("displayOnlineStatus", function(status) {
    if (status && status.online) {
        return "online";
    }

    return "offline";
});
