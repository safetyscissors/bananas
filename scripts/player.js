define(function() {
    const MOVESPEED = 12;
    const ROTATESPEED = 5;
    const ZOOMSPEED = 1;
    const MINZOOM = 8;
    let player = {
        globalPos:{x: 4000, y: 3000, z: 3, a: 0, changed: false},
        id: -1,
        owner: false
    };

    function move(keyActions) {
        if (!keyActions.length) {
            player.globalPos.changed = false;
            return;
        }
        player.globalPos.changed = true;
        for(action of keyActions) {
            switch (action) {
                case 'LEFT':
                    player.globalPos.x -=
                        (Math.cos(player.globalPos.a * Math.PI/180) * MOVESPEED * (2 + player.globalPos.z) );
                    player.globalPos.y +=
                        (Math.sin(player.globalPos.a * Math.PI/180) * MOVESPEED * (2 + player.globalPos.z) );
                    break;
                case 'RIGHT':
                    player.globalPos.x +=
                        (Math.cos(player.globalPos.a * Math.PI/180) * MOVESPEED * (2 + player.globalPos.z) );
                    player.globalPos.y -=
                        (Math.sin(player.globalPos.a * Math.PI/180) * MOVESPEED * (2 + player.globalPos.z) );
                    break;
                case 'UP':
                    player.globalPos.y -=
                        (Math.cos(player.globalPos.a * Math.PI/180) * MOVESPEED * (2 + player.globalPos.z) );
                    player.globalPos.x -=
                        (Math.sin(player.globalPos.a * Math.PI/180) * MOVESPEED * (2 + player.globalPos.z) );
                    break;
                case 'DOWN':
                    player.globalPos.y +=
                        (Math.cos(player.globalPos.a * Math.PI/180) * MOVESPEED * (2 + player.globalPos.z) );
                    player.globalPos.x +=
                        (Math.sin(player.globalPos.a * Math.PI/180) * MOVESPEED * (2 + player.globalPos.z) );
                    break;
                case 'ROTATECW':
                    player.globalPos.a += ROTATESPEED;
                    if (player.globalPos.a > 360) player.globalPos.a = player.globalPos.a % 360;
                    break;
                case 'ROTATECCW':
                    player.globalPos.a -= ROTATESPEED;
                    if (player.globalPos.a < 0) player.globalPos.a = player.globalPos.a + 360;
                    break;
                case 'ZOOMIN':
                    player.globalPos.z -= ZOOMSPEED;
                    if (player.globalPos.z < 1) player.globalPos.z = .5;
                    break;
                case 'ZOOMOUT':
                    player.globalPos.z += (player.globalPos.z === .5) ? .5 : ZOOMSPEED;
                    if (player.globalPos.z > MINZOOM) player.globalPos.z = MINZOOM;
                    break;
            }
        }
    }

    return {
        setZoom: function(z) {player.globalPos.z = z},
        getGlobalPos: function() {return player.globalPos},
        getId: function() {return player.id},
        setId: function(i) {return player.id = Number(i)},
        setOwner: function() {return player.owner = true},
        isOwner: function() {return player.owner},
        move: move
    }
});