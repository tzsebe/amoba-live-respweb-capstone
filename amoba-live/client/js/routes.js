/**
 * Iron Router logic goes here.
 */

Router.configure({
    layoutTemplate: 'layout'
});

Router.route('/', function() {
    this.redirect('/home');
});

Router.route('/home', function () {
    this.render('home');
});

Router.route('/lobby', function () {
    if (Meteor.user() && Meteor.user().profile.invitation_token.current_game) {
        this.redirect("/game_log/" + Meteor.user().profile.invitation_token.current_game);
    } else {
        this.render('lobby');
    }
});

Router.route('/game_log', function () {
    this.render('game_log');
});

Router.route('/game_log/:gameId', function () {
    console.log("Router: game id is " + this.params.gameId);
    this.render('game_details', {
        data: {gameId: this.params.gameId}
    });
});

Router.route('/leaderboard', function () {
    this.render('leaderboard');
});

Router.route('/rules', function () {
    this.render('rules');
});

Router.route('/about', function () {
    this.render('about');
});

