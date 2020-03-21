define(function() {
    let ctx;
    let grid;
    let piece;
    let gameSize;

    return {
        setupCtx: function(newCtx){
            ctx = newCtx;
        },
        resize: function(size) {
            ctx.canvas.width = size.width;
            ctx.canvas.height = size.height;
        },

        clear: function() {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        },
        animateReady: function() {
            ctx.font = "20px Arial";
            ctx.fillText(`Waiting for P2 to be ready`,
                10, 50);
        },
        animateP2Pause: function() {
            ctx.font = "20px Arial";
            ctx.fillText(`P2 is paused`,
                10, 50);
        },
        animateInit: function(timeline) {
            ctx.font = "20px Arial";
            ctx.fillText(`Starting In: ${timeline.initAnimation.length - timeline.getFrame()}`,
                10, 50);
        },
        animateStart: function() {
            ctx.font = "20px Arial";
            ctx.fillText(`hi. press esc when you're ready`,
                10, 50);
        },
        animatePause: function() {
            ctx.font = "20px Arial";
            ctx.fillText(`paused. press esc to resume`,
                10, 50);
        },
        animateEnd: function(id) {
            ctx.font = "20px Arial";
            if (id === 7) {
                ctx.fillText(`you win. press esc when you're ready.`,
                    10, 50);
                return;
            }
            ctx.fillText(`game over. press esc when you're ready.`,
                10, 50);

        },
        drawBoard: function() {
            // draw border
            ctx.lineWidth = "1";
            ctx.rect(0, 0, gameSize.width + .5, gameSize.height);
            ctx.rect(500.5, 0, gameSize.width, gameSize.height);
            ctx.stroke();

            grid.render(ctx);
            piece.render(ctx);
            piece.renderQueue(ctx);

            // export board state
            // grid.setPartnerGrid(grid.getExportGrid(piece.getActivePiece()));
            // piece.setPartnerQueue(piece.exportQueue());
        },
    }
});