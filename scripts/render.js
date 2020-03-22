define(function() {
    let ctx;
    let background = {
        pos: { x: 0, y: 0},
        size: { w: 8000, h: 6000},
        path: 'img/background.jpg',
        img: new Image()
    };
    background.img.src = background.path;

    function transformImage(img, offsetPos, pos, size) {
        let zoomed = {x: offsetPos.x / offsetPos.z, y: offsetPos.y / offsetPos.z};
        let viewCenter = {x: ctx.canvas.width/2, y: ctx.canvas.height/2};

        let newW = Math.floor(size.w / offsetPos.z);
        let newH = Math.floor(size.h / offsetPos.z);
        // console.log('camera:', newX, newY, newW, newH)

        // ctx.translate(-newX, -newY);
        // ctx.rotate(offsetPos.a * Math.PI/180);
        // ctx.translate(-newX, -newY);

        // ctx.drawImage(img, newX, newY, newW, newH);
        ctx.translate(viewCenter.x, viewCenter.y)
        ctx.rotate(offsetPos.a * Math.PI/180);
        ctx.drawImage(img, -zoomed.x, -zoomed.y, newW, newH);

        ctx.rotate(0);
        ctx.translate(-viewCenter.x, -viewCenter.y)
        ctx.beginPath();
        ctx.arc(viewCenter.x, viewCenter.y, 10, 0, 2 * Math.PI);
        ctx.stroke();
        // ctx.translate(newX, newY);
    }

    return {
        init: function(newCtx){
            ctx = newCtx;
        },
        resize: function(size) {
            ctx.canvas.width = size.width - 10;
            ctx.canvas.height = size.height - 10;
        },
        clear: function() {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        },
        draw: function(offsetPos) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            transformImage(background.img, offsetPos, background.pos, background.size);

            // export board state
            // grid.setPartnerGrid(grid.getExportGrid(piece.getActivePiece()));
            // piece.setPartnerQueue(piece.exportQueue());
        },
    }
});