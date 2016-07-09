/**
 * This runs when the server starts up.
 */
Meteor.startup(function() {
    // No users? Create a bunch!
    if (!Meteor.users.findOne()) {
        console.log("No users exist. Inserting 20 stock users.");
        for (var i = 1; i <= 20; ++i) {
            var username = "user" + i;
            var email = username + "@test.com";
            var avatar = "avatar" + i + ".jpg";

            Meteor.users.insert({
                profile: {
                    username: username,
                    avatar: avatar,
                    score: 1000,
                    invitation_token: {
                        test: "making sure this is visible."
                    }
                },
                emails: [{address: email}],
                username: username,
                services:{
                    // this is 'aaaaaa'
                    password: {"bcrypt" : "$2a$10$yqawdeYfSStoiFXclBk11O4ku26kaZjy49xDJHOW8xisP2QUTZjBy"}
                    //password: {"bcrypt" : "$2a$10$I3erQ084OiyILTv8ybtQ4ON6wusgPbMZ6.P33zzSDei.BbDL.Q4EO"}
                }
            });
        }
    }
});
