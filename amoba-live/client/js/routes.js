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
    this.render('lobby');
});

Router.route('/history', function () {
    this.render('history');
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

