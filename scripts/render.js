define(function() {
    let ctx;
    let background = {
        pos: { x: 0, y: 0},
        size: { w: 8000, h: 6000},
        path: 'img/background.jpg',
        img: new Image()
    };
    background.img.src = background.path;
    let arms = [
        {
            pos: { x: 0, y: 0},
            size: { w: 150, h: 1000},
            path: 'img/arm.png',
            img: new Image()
        },
        {
            pos: { x: 0, y: 0},
            size: { w: 150, h: 1000},
            path: 'img/arm.png',
            img: new Image()
        },
        {
            pos: { x: 0, y: 0},
            size: { w: 150, h: 1000},
            path: 'img/arm2.png',
            img: new Image()
        },
        {
            pos: { x: 0, y: 0},
            size: { w: 150, h: 1000},
            path: 'img/arm3.png',
            img: new Image()
        },
        {
            pos: { x: 0, y: 0},
            size: { w: 150, h: 1000},
            path: 'img/arm4.png',
            img: new Image()
        },
        {
            pos: { x: 0, y: 0},
            size: { w: 150, h: 1000},
            path: 'img/arm5.png',
            img: new Image()
        },
        {
            pos: { x: 0, y: 0},
            size: { w: 150, h: 1000},
            path: 'img/arm6.png',
            img: new Image()
        },
        {
            pos: { x: 0, y: 0},
            size: { w: 150, h: 1000},
            path: 'img/arm7.png',
            img: new Image()
        },
        {
            pos: { x: 0, y: 0},
            size: { w: 150, h: 1000},
            path: 'img/arm8.png',
            img: new Image()
        },
        {
            pos: { x: 0, y: 0},
            size: { w: 150, h: 1000},
            path: 'img/arm9.png',
            img: new Image()
        },
        {
            pos: { x: 0, y: 0},
            size: { w: 150, h: 1000},
            path: 'img/arm10.png',
            img: new Image()
        },

    ];
    for(let arm of arms) {
        arm.img.src = arm.path;
    }

    function drawBackground(img, camera, pos, size) {
        let viewCenter = {x: ctx.canvas.width/2, y: ctx.canvas.height/2};
        let zoomed = {x: camera.x / camera.z, y: camera.y / camera.z};
        let newW = Math.floor(size.w / camera.z);
        let newH = Math.floor(size.h / camera.z);

        ctx.translate(viewCenter.x, viewCenter.y);
        ctx.rotate(camera.a * Math.PI/180);
        ctx.drawImage(img, -zoomed.x, -zoomed.y, newW, newH);

        ctx.rotate(-camera.a * Math.PI/180);
        ctx.translate(-viewCenter.x, -viewCenter.y);
        ctx.beginPath();
        // ctx.arc(viewCenter.x, viewCenter.y, 10, 0, 2 * Math.PI); // debug player position
        ctx.stroke();
    }

    function drawPoints(points, camera) {
        let viewCenter = {x: ctx.canvas.width/2, y: ctx.canvas.height/2};
        let zoomedPos = {x: camera.x / camera.z, y: camera.y / camera.z, z: camera.z};
        ctx.translate(viewCenter.x, viewCenter.y);
        ctx.rotate(camera.a * Math.PI/180);
        for(let point of points) {
            let transformed = {x: point.x / zoomedPos.z - zoomedPos.x, y: point.y / zoomedPos.z - zoomedPos.y};
            ctx.translate(transformed.x, transformed.y);
            ctx.fillStyle = 'red';
            ctx.fillRect(0,0, 4, 4)
            ctx.translate(-transformed.x, -transformed.y);

        }
        ctx.rotate(-camera.a * Math.PI/180);
        ctx.translate(-viewCenter.x, -viewCenter.y);
    }

    function drawTiles(tiles, camera, tileConfigs, myId) {
        let viewCenter = {x: ctx.canvas.width/2, y: ctx.canvas.height/2};
        let zoomedPos = {x: camera.x / camera.z, y: camera.y / camera.z, z: camera.z};
        let zoomedSize = {
            w: Math.floor(tileConfigs.w / camera.z),
            h: Math.floor(tileConfigs.h / camera.z),
        };

        // match user angle
        ctx.translate(viewCenter.x, viewCenter.y);
        ctx.rotate(camera.a * Math.PI/180);
        for(let tile of tiles) {
            let myTile = tile.data[5] === -1|| tile.data[5] === myId;
            drawTile(tile.pos, tile.data[1], tile.data[3], tile.data[4], viewCenter, zoomedPos, zoomedSize, tile.data[0], myTile);
        }
        // correct user angle
        ctx.rotate(-camera.a * Math.PI/180);
        ctx.translate(-viewCenter.x, -viewCenter.y);
    }

    function drawTile(tilePos, faceup, selected, hovered, viewCenter, zoomedPos, zoomedSize, text, myTile) {
        let transformed = {x: tilePos.x / zoomedPos.z - zoomedPos.x, y: tilePos.y / zoomedPos.z - zoomedPos.y};
        ctx.translate(transformed.x, transformed.y);
        ctx.rotate(tilePos.a * Math.PI * 2);

        // Draw tile
        if (hovered && myTile) {
            ctx.fillStyle = 'blue';
            ctx.fillRect(-2, -2, zoomedSize.w+4, zoomedSize.h+4);
            ctx.fillStyle = '#E9CCA4';
            ctx.fillRect(0, 0, zoomedSize.w, zoomedSize.h);
        } else if (selected && myTile) {
            ctx.fillStyle = 'grey';
            ctx.fillRect(-2, -2, zoomedSize.w+4, zoomedSize.h+4);
            ctx.fillStyle = '#E9CCA4';
            ctx.fillRect(0, 0, zoomedSize.w, zoomedSize.h);
        } else {
            ctx.fillStyle = '#e6c0a1';
            ctx.fillRect(-2, -2, zoomedSize.w, zoomedSize.h);
            ctx.fillStyle = '#E9CCA4';
            ctx.fillRect(0, 0, zoomedSize.w, zoomedSize.h);
        }

        // Draw text.
        if (faceup === 1) {
            let fontsize = 20 / zoomedPos.z;
            ctx.font = `bold ${fontsize}px verdana`;
            ctx.fillStyle = 'black'
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(text, (zoomedSize.w) /2, (zoomedSize.h + fontsize)/2);
        }
        ctx.rotate(-tilePos.a * Math.PI * 2);
        ctx.translate(-transformed.x, -transformed.y);
    }

    function drawArm(mouse, camera, armId) {
        let viewCenter = {x: ctx.canvas.width/2, y: ctx.canvas.height/2};
        let arm = arms[armId];
        let newW = Math.floor(arm.size.w / camera.z);
        let newH = Math.floor(arm.size.h / camera.z);
        // rotate arm based on mouse distance to edge.
        let angle = .5 * (mouse.x - viewCenter.x)/viewCenter.x;
        if (camera.z <= 2) {
            ctx.translate(mouse.x, mouse.y);
            ctx.rotate(angle);
            ctx.drawImage(arm.img, 40, 40, newW, newH)
            // correct user angle
            ctx.rotate(-angle);
            ctx.translate(-mouse.x, -mouse.y);
        } else {

        }
    }

    function drawFriends(friends, camera, myId) {
        let viewCenter = {x: ctx.canvas.width/2, y: ctx.canvas.height/2};
        let zoomedPos = {x: camera.x / camera.z, y: camera.y / camera.z, z: camera.z};
        ctx.translate(viewCenter.x, viewCenter.y);
        ctx.rotate(camera.a * Math.PI/180);
        for (friend of friends) {
            if (friend.id === myId) continue;
            if (!friend.id) continue;
            let arm = arms[friend.id];
            let scaled = {
                x: friend.pos.x / camera.z - zoomedPos.x,
                y: friend.pos.y / camera.z - zoomedPos.y,
                w: Math.floor(arm.size.w / camera.z),
                h: Math.floor(arm.size.h / camera.z),
            }
            if (camera.z <= 2) {
                ctx.translate(scaled.x, scaled.y);
                ctx.rotate(-friend.pos.a * Math.PI/180);
                ctx.drawImage(arm.img, 0, 0, scaled.w, scaled.h);
                ctx.rotate(friend.pos.a * Math.PI/180);
                ctx.translate(-scaled.x, -scaled.y);
            }
        }
        ctx.rotate(-camera.a * Math.PI/180);
        ctx.translate(-viewCenter.x, -viewCenter.y);
    }

    return {
        init: function(newCtx){
            ctx = newCtx;
        },
        resize: function(size) {
            ctx.canvas.width = size.w;
            ctx.canvas.height = size.h;
        },
        clear: function() {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        },
        drawBoard: function(offsetPos) {
            drawBackground(background.img, offsetPos, background.pos, background.size) ;
        },
        drawPoints: drawPoints,
        drawTiles: drawTiles,
        drawArm: drawArm,
        drawFriends: drawFriends,
    }
});