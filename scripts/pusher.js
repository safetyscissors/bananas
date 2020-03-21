

define(function() {
    let pusher;
    let channel;
    let subscribed = false;
    function connect(gridCallback, queueCallback, readyCallback, pauseCallback, endCallback) {
        // Pusher.logToConsole = true;
        pusher = new Pusher('6cdeaa1be58d06df13ae', { cluster: 'us3', authEndpoint: '/twotris/server/auth/' });
        channel = pusher.subscribe('private-channel');
        channel.bind('pusher:subscription_succeeded', function() {
            subscribed = true;
        });
        channel.bind('pusher:subscription_error', function(e) {
            console.log(e)
        });
        channel.bind('client-grid', function(data) {
            gridCallback(data);
        });
        channel.bind('client-queue', function(data) {
            queueCallback(data);
        });
        channel.bind('client-ready', function(data) {
            readyCallback(data);
        });
        channel.bind('client-pause', function(data) {
            pauseCallback(data);
        });
        channel.bind('client-end', function(data) {
            endCallback(data);
        });
    }

    function sendGrid(grid) {
        if (subscribed) {
            channel.trigger('client-grid', grid);
        }
    }

    function sendQueue(queue) {
        if (subscribed) {
            channel.trigger('client-queue', queue);
        }
    }

    function sendReady() {
        if (subscribed) {
            channel.trigger('client-ready', 'true');
        }
    }

    function sendPause(state) {
        if (subscribed) {
            channel.trigger('client-pause', state.toString());
        }
    }

    function sendEnd() {
        channel.trigger('client-end', 'true');
    }

    return {
        connect: connect,
        sendGrid: sendGrid,
        sendQueue: sendQueue,
        sendReady: sendReady,
        sendPause: sendPause,
        sendEnd: sendEnd,
    }
});