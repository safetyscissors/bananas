

define(function() {
    let pusher;
    let channel;
    let subscribed = false;
    let stagedData = [];
    let latestData = [];

    function joinRoom(roomName, armPickedCallback, endGameCallback, syncPlacedTilesCallback) {
        // Pusher.logToConsole = true;
        pusher = new Pusher('6cdeaa1be58d06df13ae', { cluster: 'us3', authEndpoint: '/bananas/server/auth/' });
        channel = pusher.subscribe(`private-${roomName}`);
        channel.bind('pusher:subscription_error', function(e) {
            console.log(e)
        });
        channel.bind('client-update', function(data) {
            latestData.push(data);
        })
        channel.bind('client-picked-id', function(id) {
            armPickedCallback(id);
        });
        channel.bind('client-end-game', function() {
            endGameCallback();
        });
        channel.bind('client-sync-tiles', function(data) {
            syncPlacedTilesCallback(data);
        });
    }
    function connectOwner(roomName, sendTilesCallback, armPickedCallback, endGameCallback, syncPlacedTilesCallback, currentIdsCallback) {
        joinRoom(roomName, armPickedCallback, endGameCallback, syncPlacedTilesCallback);
        channel.bind('pusher:subscription_succeeded', function() {
            subscribed = true;
            channel.trigger('client-response-ids', currentIdsCallback());
        });
        channel.bind('client-request-tiles', function() {
            channel.trigger('client-response-tiles', sendTilesCallback());
        });
        channel.bind('client-request-ids', function() {
            channel.trigger('client-response-ids', currentIdsCallback());
        });
    }
    function connect(roomName, loadTilesCallback, armPickedCallback, endGameCallback, syncPlacedTilesCallback, loadArmsCallback ) {
        joinRoom(roomName, armPickedCallback, endGameCallback, syncPlacedTilesCallback);
        channel.bind('pusher:subscription_succeeded', function() {
            subscribed = true;
            channel.trigger('client-request-ids', {});
        });
        channel.bind('client-response-tiles', function(data) {
            loadTilesCallback(data);
        });
        channel.bind('client-response-ids', function(data) {
            loadArmsCallback(data);
        });
    }
    function requestIds() {
        channel.trigger('client-request-ids', {});
    }
    function pickId(id) {
        channel.trigger('client-picked-id', id);
    }
    function requestTiles() {
        channel.trigger('client-request-tiles', {});
    }
    function endGame() {
        channel.trigger('client-end-game', {});
    }
    function periodicSync(allPlacedTiles) {
        if (!allPlacedTiles || allPlacedTiles.length === 0) return;
        channel.trigger('client-sync-tiles', allPlacedTiles);
    }
    function stage(playerId, armPos, pieces){
        if (playerId || playerId === 0) {
            stagedData[0] = playerId;
        }
        if (armPos) {
            stagedData[1] = armPos.x;
            stagedData[2] = armPos.y;
            stagedData[3] = armPos.a;
        }
        if (pieces) {
            if (!stagedData[4]) stagedData[4] = {};
            for (piece of pieces) {
                stagedData[4][piece[9]] = piece;
            }
        }
    }
    function sendData() {
        if (stagedData.length <= 1) return;
        stagedData[4] = Object.values(stagedData[4]);
        channel.trigger('client-update', stagedData);
        stagedData = [];
    }

    function getLatest() {
        if (latestData.length === 0) return;
        let keyedData = {};
        for(dataRow of latestData) {
            if (!keyedData[dataRow[0]]) keyedData[dataRow[0]] = {playerId: dataRow[0], pieces: []};
            // if armpos is set, overwrite
            if (dataRow[1] != null || dataRow[1] != undefined) {
                keyedData[dataRow[0]].armPos = {
                    x: dataRow[1],
                    y: dataRow[2],
                    a: dataRow[3],
                }
            }
            keyedData[dataRow[0]].pieces = keyedData[dataRow[0]].pieces.concat(dataRow[4]);
        }
        return Object.values(keyedData);
    }

    return {
        connect: connect,
        connectOwner: connectOwner,
        isConnected: function() {return subscribed},
        hasData: function() {return stagedData.length > 1},
        stage: stage,
        sendData: sendData,
        getLatest: getLatest,
        requestTiles: requestTiles,
        clearLatest: function() {latestData = []},
        pickId: pickId,
        endGame: endGame,
        requestIds:requestIds,
        periodicSync: periodicSync,
    }
});