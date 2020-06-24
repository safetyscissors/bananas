define(function() {
    const MAX_SPEED = 10;
    const CURSOR_OFFSET = 3;
    let tiles = [];
    let selectable = [];
    let selected = [];
    let mousedTiles = [];
    let placingTiles = [];
    let tileDimension = {w: 0, h: 0};
    let playerId = -1;
    let friendTiles = [];
    let waitTicksToReload = 30;
    function tileFactory(value, targetPos, id) {
        return {
            pos: {
                x:Math.round(Math.random() * targetPos.x * .16 + (targetPos.x * .9)),
                y:Math.round(Math.random() * targetPos.y * .16 + (targetPos.y * .9)),
                a:Math.round(Math.random()*100)  / 100,
            },
            data: [value, 0,1,0,0,-1, id], // 0value, 1faceup, 2selectable, 3selected, 4hovered , 5ownerId, 6tileid
            // owner
        }
    }

    function minify(targetTiles) {
        const smalldata = [];
        for (tile of targetTiles) {
            smalldata.push([Math.round(tile.pos.x), Math.round(tile.pos.y), Math.round(tile.pos.a*100)/100, tile.data[0], tile.data[1], tile.data[2], tile.data[3], tile.data[4], tile.data[5], tile.data[6]]);
        }
        return smalldata;
    }
    function unminify(data) {
        const newTiles = [];
        for (tile of data) {
            newTiles.push({
                pos: {
                    x: tile[0],
                    y: tile[1],
                    a: tile[2],
                },
                data: [tile[3], tile[4], tile[5], tile[6], tile[7], tile[8], tile[9]],
            })
        }
        return newTiles;
    }

    function loadTiles(recievedTiles) {
        if (tiles.length === 0 ) {
            tiles = unminify(recievedTiles);
            selectable = tiles
        }
    }

    function generateTiles(pieces) {
        let targetPos = {x: 5000, y: 2600};
        tiles = pieces.split('').map((value, index) => tileFactory(value, targetPos, index));
        selectable = tiles;
    }

    function init(configTileDimension, id) {
        playerId = Number(id);
        tileDimension = configTileDimension;
    }

    function unHighlight() {
        for(tile of mousedTiles) {
            tile.data[4] = 0 // hovered
        }
    }

    function highlight() {
        for(tile of mousedTiles) {
            tile.data[4] = 1 // hovered
        }
    }

    function pointInRect(x1, y1, x2, y2, a, w, h) {
        let x = x2 - x1;
        let y = y2 - y1;
        let c = Math.hypot(x, y);
        let angle = (Math.atan2(x, y) - (.5*Math.PI));

        angle = angle + a;
        let normalY = -Math.sin(angle) * c;
        let normalX = Math.cos(angle) * c;
        return pointInRectNormal(normalX, normalY, w, h);
    }

    function pointInRectNormal(x, y, w, h) {
        return ((x) >= 0 && (x) <= w
            && (y) >= 0 && (y) <= h)
    }

    function findSelectable(mouse, moved) {
        if (!mouse.changed && !moved) return;
        selectable = selectable.filter(tile => tile.data[2] === 1 && (tile.data[5] === -1 || tile.data[5] === playerId));
        mousedTiles = selectable
            .filter(tile =>
                Math.abs(mouse.realX - tile.pos.x) < tileDimension.h * 1.3
                && Math.abs(mouse.realY - tile.pos.y) < tileDimension.h * 1.3)
            .filter(tile =>
                pointInRect(tile.pos.x, tile.pos.y, mouse.realX, mouse.realY, tile.pos.a * 2 * Math.PI, tileDimension.w, tileDimension.h));
    }

    function mouseClick(mouse, isVertical, isHorizontal, cameraAngle) {
        if (!mouse.clicked) return; // if no click, do nothing.
        if (mousedTiles.length === 0) { // nothing clicked. try to place a selected tile.
            if (!selected.length) return; // if nothing is selected, dont place anything.
            if (isVertical || isHorizontal) {
                placingTiles = selected;
                selected = [];
                for(placingTile of placingTiles) {
                    placingTile.targetPos = {x: placingTile.pos.x-CURSOR_OFFSET, y: placingTile.pos.y-CURSOR_OFFSET, a: tile.pos.a, s: 1};
                }
            } else {
                let tile = selected.shift();
                let tileCenter = {
                    x:Math.cos(cameraAngle * Math.PI/180) * tileDimension.w/2
                        + Math.sin(cameraAngle * Math.PI/180) * tileDimension.h/2,
                    y:Math.cos(cameraAngle * Math.PI/180) * tileDimension.h/2
                        - Math.sin(cameraAngle * Math.PI/180) * tileDimension.w/2
                }
                tile.targetPos = {x: mouse.realX - tileCenter.x, y: mouse.realY- tileCenter.y, a: tile.pos.a, s: 1};
                placingTiles.push(tile);
            }
        } else { // clicked on a tile. try to select clicked tile.
            let tile = mousedTiles[mousedTiles.length-1]; // top most tile.
            if (tile.data[2] === 0 || !(tile.data[5] === -1 || tile.data[5] === playerId)) return // if not selectable, do nothing.
            tile.data[1] = 1; // faceup
            tile.data[3] = 1; // selected
            tile.data[2] = 0; // selectable
            if (tile.data[5] === -1) {
                tile.data[5] = playerId;
            }
            selected.push(tile);
        };
    }

    function moveTiles(mouse, isHorizontal, isVertical, cameraAngle) {
        let MIN_MOVE_THRESHOLD = 4;
        let ANGLE_DRIFT_SPEED = .02;
        let SPEED_MULTIPLIER = 1.5;
        let WIGGLE_CHANCE = .1;
        let WIGGLE_ROOM = 10;

        for (friendTile of friendTiles) {
            friendTile.pos.a = friendTile.targetPos.a;
            let distance = Math.hypot(friendTile.pos.x - friendTile.targetPos.x, friendTile.pos.y - friendTile.targetPos.y);
            let angleToDest = Math.atan2(friendTile.pos.x - friendTile.targetPos.x, friendTile.pos.y - friendTile.targetPos.y);
            // accelerate speed
            friendTile.targetPos.s = 5;
            if (distance > friendTile.targetPos.s) {
                friendTile.targetPos.s = friendTile.targetPos.s * 2;
            } else if (friendTile.targetPos.s > distance) {
                friendTile.targetPos.s = distance / 2;
            } else if (distance < friendTile.targetPos.s && friendTile.targetPos.s > 1 && distance > MIN_MOVE_THRESHOLD) {
                friendTile.targetPos.s = friendTile.targetPos.s / 2;
            }

            // compute location
            if (distance > MIN_MOVE_THRESHOLD) {
                friendTile.pos.x -= Math.sin(angleToDest) * friendTile.targetPos.s;
                friendTile.pos.y -= Math.cos(angleToDest) * friendTile.targetPos.s;
            } else {
                friendTile.targetPos.s = 1;
                friendTile.pos.x = friendTile.targetPos.x;
                friendTile.pos.y = friendTile.targetPos.y;
            }
        }

        // move placed tiles from hand to map.
        for (placingTile of placingTiles) {
            let distance = Math.hypot(placingTile.pos.x - placingTile.targetPos.x, placingTile.pos.y - placingTile.targetPos.y);
            let angleToDest = Math.atan2(placingTile.pos.x - placingTile.targetPos.x, placingTile.pos.y - placingTile.targetPos.y);
            // accelerate speed
            if (distance > placingTile.targetPos.s) {
                placingTile.targetPos.s = placingTile.targetPos.s * 2;
            } else if (placingTile.targetPos.s > distance) {
                placingTile.targetPos.s = distance / 2;
            } else if (distance < placingTile.targetPos.s && placingTile.targetPos.s > 1 && distance > MIN_MOVE_THRESHOLD) {
                placingTile.targetPos.s = placingTile.targetPos.s / 2;
            }
            // compute location
            if (distance > MIN_MOVE_THRESHOLD) {
                placingTile.pos.x -= Math.sin(angleToDest) * placingTile.targetPos.s;
                placingTile.pos.y -= Math.cos(angleToDest) * placingTile.targetPos.s;
            } else {
                placingTile.targetPos.s = 1;
                if (placingTile.targetPos && placingTile.targetPos.x !=0 && placingTile.targetPos.y !=0){
                    placingTile.pos.x = placingTile.targetPos.x;
                    placingTile.pos.y = placingTile.targetPos.y;
                }else {
                    console.warn('lostTargetPos placing');
                }

                // when arrived, place back in selectable.
                placingTile.data[3] = 0; // selected
                placingTile.data[2] = 1; // selectable
                selectable.push(placingTile);
            }
        }
        placingTiles = placingTiles.filter(t => t.data[3] === 1);

        // move selected tiles in hand.
        for ([i,tile] of selected.entries()) {
            let floatDistance = {x: 50, y: 1, offset: 25};
            if (isHorizontal) floatDistance = {x: 25, y: 1, offset: 0};
            if (isVertical) floatDistance = {x: 1, y: 30, offset: 0};
            // init targetPosition
            if (!tile.targetPos) {
                tile.targetPos = {a: 0, s: 1};
            }
            if (!tile.targetPos.drift) {
                tile.targetPos.drift = {x: Math.random()*WIGGLE_ROOM, y: Math.random()*WIGGLE_ROOM};
            }

            // init destination
            let destination = {
                x: mouse.realX +
                    + (Math.cos(cameraAngle/180 * Math.PI) * (-tileDimension.w/2 + floatDistance.offset + i * floatDistance.x + tile.targetPos.drift.x))
                    + (Math.sin(cameraAngle/180 * Math.PI) * (-tileDimension.h/2 + i * floatDistance.y + tile.targetPos.drift.y)),
                y: mouse.realY
                    + (Math.cos(cameraAngle/180 * Math.PI) * (-tileDimension.h/2 + i * floatDistance.y + tile.targetPos.drift.y))
                    - (Math.sin(cameraAngle/180 * Math.PI) * (-tileDimension.w/2 + floatDistance.offset + i * floatDistance.x + tile.targetPos.drift.x))};
            let distance = Math.hypot(tile.pos.x - destination.x, tile.pos.y - destination.y);
            let angleToDest = Math.atan2(tile.pos.x - destination.x, tile.pos.y - destination.y);
            // move toward targetPos angle
            // tile angle is a percent. 0 - 1
            let targetAngle = 1-cameraAngle/360;

            if (tile.pos.a > targetAngle + ANGLE_DRIFT_SPEED && Math.abs(tile.pos.a - targetAngle) > .5) {
                tile.pos.a += ANGLE_DRIFT_SPEED;
            } else if (tile.pos.a < targetAngle - ANGLE_DRIFT_SPEED && Math.abs(tile.pos.a - targetAngle) > .5) {
                tile.pos.a -= ANGLE_DRIFT_SPEED;
            } else if (tile.pos.a < targetAngle - ANGLE_DRIFT_SPEED) {
                tile.pos.a += ANGLE_DRIFT_SPEED;
            } else if (tile.pos.a > targetAngle + ANGLE_DRIFT_SPEED) {
                tile.pos.a -= ANGLE_DRIFT_SPEED;
            }
            if (tile.pos.a < 0) {
                tile.pos.a += 1;
            } else if (tile.pos.a > 1) {
                tile.pos.a -= 1;
            }

            // ease speed based on distance to target
            if (distance < tile.targetPos.s && tile.targetPos.s > 1 && distance > MIN_MOVE_THRESHOLD) {
                tile.targetPos.s = tile.targetPos.s / SPEED_MULTIPLIER;
            } else if (distance > tile.targetPos.s) {
                tile.targetPos.s = tile.targetPos.s * SPEED_MULTIPLIER;
            } else if (tile.targetPos.s > distance) {
                tile.targetPos.s = distance / SPEED_MULTIPLIER;
            }

            // move toward target.
            if (distance > MIN_MOVE_THRESHOLD) {
                tile.pos.x -= Math.sin(angleToDest) * tile.targetPos.s
                    // + Math.cos(angleToDest) * tile.targetPos.s;
                tile.pos.y -= Math.cos(angleToDest) * tile.targetPos.s
                    // + Math.sin(angleToDest) * tile.targetPos.s;
            // else arrived.
            } else {
                tile.targetPos.s = 1;
                if (destination && destination.x !=0 && destination.y !=0){
                    tile.pos.x = destination.x;
                    tile.pos.y = destination.y;
                }else {
                    console.warn('lostTargetPos moving');
                }
                if (Math.random() < WIGGLE_CHANCE) {
                    tile.targetPos.drift.x = Math.random() * WIGGLE_ROOM;
                    tile.targetPos.drift.y = Math.random() * WIGGLE_ROOM;
                }
            }
        }
    }

    function resetEverything() {
        selectable = tiles.filter(tile => tile.data[5] === playerId || tile.data[5] === -1);
        console.log("RESET", JSON.stringify(selected.map(tile => tile.data)), JSON.stringify(placingTiles.map(tile => tile.data)))
        for (tile of selectable) {
            tile.data[2] = 1;
            tile.data[3] = 0;
            tile.data[4] = 0;
            delete tile.targetPos;
        }
        selected = [];
        mousedTiles = [];
        placingTiles = [];
    }

    function tick(mouse, cameraPos, controls, requestLoadTiles) {
        // reset all player tiles.
        if (controls.indexOf("RESET") >= 0) {
            resetEverything();
        }

        if (tiles.length === 0) {
            waitTicksToReload--;
        }
        if (tiles.length === 0 && waitTicksToReload < 0) {
            waitTicksToReload = 30;
            requestLoadTiles();
        }

        let isHorizontal = controls.indexOf("HORIZONTAL") >= 0 ;
        let isVertical = controls.indexOf("VERTICAL") >= 0;
        // if horizontal, then horizontal.
        if (isHorizontal) isVertical = false;
        unHighlight();
        findSelectable(mouse, cameraPos.changed);
        mouseClick(mouse, isHorizontal, isVertical, cameraPos.a);
        moveTiles(mouse, isHorizontal, isVertical, cameraPos.a);
        highlight();
    }

    function getChanged() {
        let data = minify([].concat(selected, placingTiles));

        return data;
    }

    function moveFriendTiles(playerDatas) {
        let changes = playerDatas.map(row => row.pieces).flat();
        if (!changes || changes.length === 0) return;

        keyedChange = {}
        for (change of unminify(changes)) {
            keyedChange[change.data[6]] = change;
        }
        friendTiles = [];
        for (id of Object.keys(keyedChange)) {
            tiles[id].data = keyedChange[id].data;
            if (!tiles[id].targetPos) tiles[id].targetPos = {s:1}
            tiles[id].targetPos.x = keyedChange[id].pos.x;
            tiles[id].targetPos.y = keyedChange[id].pos.y;
            tiles[id].targetPos.a = keyedChange[id].pos.a;
            friendTiles.push(tiles[id])
        }
    }

    function getAllPlacedTiles() {
        if (playerId < 1) return [];

        return minify(selectable
            .filter(tile =>
                tile.data[2] === 1
                && tile.data[5] === playerId
                && tile.data[5]!=-1));
    }

    function syncPlacedTilesCallback(data) {
        if (tiles.length <=0) return;
        for (change of unminify(data)) {
            if (!tiles[change.data[6]]) return;
            if (change.data[6] === -1) return;
            if (!change.pos || change.pos.x === 0 || change.pos.y === 0) return;
            tiles[change.data[6]].pos = change.pos;
        }
    }

    return {
        getTiles: function() {return tiles},
        getChanged: getChanged,
        sendTiles: function() {return minify(tiles)},
        loadTiles: loadTiles,
        generateTiles: generateTiles,
        minify: minify,
        tick: tick,
        init: init,
        moveFriendTiles: moveFriendTiles,
        getAllPlacedTiles: getAllPlacedTiles,
        syncPlacedTilesCallback: syncPlacedTilesCallback,
    }
});