(function () {
    // document.addEventListener("DOMContentLoaded", init);
    // window.addEventListener('load', init, false);
    init();
})();

function init() {
    require([
        'scripts/logger.js',
        'scripts/configs.js',
        'scripts/states.js',
        'scripts/render.js',
        'scripts/player.js',
        'scripts/controls.js',
        'scripts/tiles.js',
        'scripts/pusher.js',
        'scripts/friends.js',
    ], function (logger, configs, states, render, player, controls, tiles, pusher, friends) {
        const canvasDom = document.querySelector("#game");
        const ctx = canvasDom.getContext("2d");

        // setup
        logger.all();
        logger.log('configs:', configs);
        render.init(ctx);
        controls.init(configs);
        states.idle();

        // listeners
        window.onresize = configs.updateSize;

        function armPickedCallback(id) {
            let elId = 'id-' + id;
            friends.addId(Number(id));
            document.getElementById(elId).classList.remove('turnOn');
        }

        function endGameCallback() {
            document.getElementById('lobbyWrapper').classList.remove('fadeOut');
            document.getElementById('lobbyWrapper').classList.add('fadeIn');
            document.getElementById('gameWrapper').classList.remove('fadeIn');
            document.getElementById('gameWrapper').classList.add('fadeOut');
            setTimeout(function() {
                window.location.reload(false);
            }, 1000)
        }
        // select room
        document.querySelector("#zoom1").addEventListener("click", function (e) {
            player.setZoom(.5);
        });
        document.querySelector("#zoom2").addEventListener("click", function (e) {
            player.setZoom(1);
        });
        document.querySelector("#zoom3").addEventListener("click", function (e) {
            player.setZoom(4);
        });
        // select room
        document.querySelector(".room").addEventListener("click", function (e) {
            if (window.location.href.indexOf('?o=') > 0) {
                document.getElementById('endGame').classList.remove('hidden')
                player.setOwner();
                pusher.connectOwner(e.target.id, tiles.sendTiles, armPickedCallback, endGameCallback, tiles.syncPlacedTilesCallback, function () {
                    return [Number(player.getId())].concat(friends.currentIdsCallback());
                });
                document.querySelectorAll(".arm").forEach(function (el) {
                    el.classList.add('turnOn')
                })
            } else {
                pusher.connect(e.target.id, tiles.loadTiles, armPickedCallback, endGameCallback, tiles.syncPlacedTilesCallback, function (usedIds) {
                    document.querySelectorAll(".arm").forEach(function (el) {
                        let id = Number(el.id.split('-')[1]);
                        if (usedIds.includes(id)) return;
                        el.classList.add('turnOn')
                    });
                })
            }
            document.getElementById('rooms').classList.remove('fadeInUp');
            document.getElementById('rooms').classList.add('fadeOutUp');
            document.getElementById('armSelect').classList.add('fadeInUp');
        });
        // select arm
        document.querySelectorAll(".arm").forEach(function (el) {
            el.addEventListener("click", function (e) {
                let id = Number(e.target.id.split('-')[1]);
                player.setId(id);
                pusher.pickId(String(id));
                states.init();
                document.getElementById('armSelect').classList.remove('fadeInUp');
                document.getElementById('armSelect').classList.add('fadeOutUp');
                document.getElementById('lobbyWrapper').classList.add('fadeOut');
                document.getElementById('gameWrapper').classList.add('fadeIn');
            });
        });
        // end game
        document.querySelector("#endGame").addEventListener("click", function (e) {
            window.location.reload();
            pusher.endGame();
        });

        // game loop
        setInterval(function () {
            if (states.isIdle()) return;
            tick(states, logger, controls, player, tiles, configs, pusher, friends);
            draw(render, configs, player, tiles, controls, friends);
        }, 1000 / configs.fps);

        setInterval(function () {
            if (!pusher.isConnected()) return;
            pusher.sendData();
        }, 1000 / configs.txFps);

        setInterval(function () {
            if (!pusher.isConnected()) return;
            pusher.periodicSync(tiles.getAllPlacedTiles());
        }, 10000);
    });
}

function tick(states, logger, controls, player, tiles, configs, pusher, friends) {
    controls.tick(player.getGlobalPos(), configs.canvasSize);
    friends.tick();
    player.move(controls.getQueue());
    tiles.tick(controls.getMouse(), player.getGlobalPos(), controls.getQueue(), pusher.requestTiles);

    if (states.isInit()) {
        tiles.init(configs.tile, player.getId()); // create tiles (only owner does this)
        if (player.isOwner()) {
            tiles.generateTiles(configs.pieces);
        } else {
            pusher.requestTiles();
        }
        // broadcast tiles to room
        states.run();
    }

    if (states.isRunning()) {
        // stage data to transmit
        if (controls.getMouseMoved()) {
            let mouse = controls.getMouse();
            pusher.stage(
                player.getId(),
                {
                    x: mouse.realX,
                    y: mouse.realY,
                    a: player.getGlobalPos().a,
                },
                tiles.getChanged());
        }
        // receive data.
        let newData = pusher.getLatest();
        if (newData) {
            friends.moveFriendArms(newData);
            tiles.moveFriendTiles(newData);
            pusher.clearLatest();
        }

    }

    if (states.hasStateChanged()) {
        logger.log(states.getStateName());
    }

    controls.resetQueue();
}

function draw(render, configs, player, tiles, controls, friends) {
    // render.clear();
    render.resize(configs.canvasSize);
    render.drawBoard(player.getGlobalPos());
    render.drawTiles(tiles.getTiles(), player.getGlobalPos(), configs.tile, player.getId());
    render.drawArm(controls.getMouse(), player.getGlobalPos(), player.getId());
    render.drawFriends(friends.getFriendsPos(), player.getGlobalPos(), player.getId());
    // render.drawPoints(tiles.debugPoints(), player.getGlobalPos());
}
