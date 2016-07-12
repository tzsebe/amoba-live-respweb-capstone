//
// Template helpers for game
//

Template.game_details.helpers({
    game: function() {
        return Games.findOne({_id: this.gameId});
    },
    cells: function() {
        var game = Games.findOne({_id: this.gameId});

        var cellWidthStyle = 100/GRID_WIDTH + '%';
        if (game) {
            var w = game.gridWidth;
            var h = game.gridHeight;

            // TODO: actually include stuff
            var cells = [];
            for (var idx = 0; idx < w*h; ++idx) {
                var x = idx % w;
                var y = Math.floor(idx / w);
                cells.push({
                    x: x,
                    y: y,
                    cellWidthStyle: cellWidthStyle
                });
            }

            return cells;
        }

        return null;
    }
});

