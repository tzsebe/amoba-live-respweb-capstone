# Amőba Live

This is an online rendition of the Hungarian game, Amőba. It's basically 5-in-a-row Tic-Tac-Toe, played on a larger grid.

This is implemented using Meteor.js.

I am building this as my Capstone project for Coursera's [Full Stack Website Development](https://www.coursera.org/specializations/website-development) specialization.


# Some Implementation Details

## Player Matching Process

We actually maintain the state of the matching (who challenging whom, and current games being played) in an "invitation token" document inside the user profile. In retrospect, that may have been better off going into its own Mongo collection, for flexibility reasons. For this current usecase, it was sufficient to just shove it into the user profile, as a read-only field.



## Game Mechanics and Data Flow

In the interest of preventing various forms of cheating, ALL game operations, including score updates, are done through the "gameMove" method on the server. The only way to update any of the user profile attributes pertaining to score, is through those methods (by playing games). This ensures that nobody tries to cheat. ALL state is maintained and handled on the server, and any timers/display on the client is really just for show, and is driven by the read-only state of the world.

Basically, we assume clients are malicious.


## Concurrency

My understanding is that Meteor guarantees that any given method has an invocation queue (or can be thought of as such), and only executes one instance of the method call. That's what we rely on for concurrency. There are only two methods: "matchUser" and "gameMove". The former handles all things related to player matching and game bootstrapping, while the the latter handles all things related to playing the game itself.

There is also a background interval that handles reaping abandoned games and the likes. There may be a slight race condition if you try to make a move on an abandoned game while the reaper is closing it, but it would manifest as a strange blip, rather than a catastrophic system issue. No inconsistent state would remain.


# Credits

## Profile Cat Pics

I opted to just make everyone's profile a random cat picture. I searched for free cat pictures, and found 50 of them here:

https://newevolutiondesigns.com/50-free-hd-cat-wallpapers

I grabbed them all, and created the thumbnails with imagemagick.

## User Status Icons

The user status icons come from AdiumXtras:

http://adiumxtras.com/index.php?a=xtras&xtra_id=2246

## Landing Page Banner

For this, I just google-imaged, and ended up grabbing the pic from:

https://infoc.eet.bme.hu

## AmobaEngine.js

The javascript game engine (AmobaEngine.js) was built by me, from scratch, and is freely available to anyone who wants to grab it.
