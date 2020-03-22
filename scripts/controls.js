define(function() {
    let keyDown = {};
    let controlQueue = [];

    function setupListeners() {
        document.onkeydown = latchKeyDown;
        document.onkeyup = latchKeyUp;
        document.onwheel = scale;
    }

    function scale(e) {
        let action;
        if (e.deltaY < 0) {
            action = 'ZOOMIN'
        } else {
            action = 'ZOOMOUT'
        }
        if (controlQueue.indexOf(action) > -1) return;
        controlQueue.push(action);
    }

    function latchKeyDown(e) {
        keyDown[e.code] = true;
    }
    function latchKeyUp(e) {
        keyDown[e.code] = false;
    }

    function getQueue() {
        let action = '';
        if (keyDown['KeyA'] || keyDown['ArrowLeft']) {
            controlQueue.push('LEFT');
        }
        if (keyDown['KeyD'] || keyDown['ArrowRight']) {
            controlQueue.push('RIGHT');
        }
        if (keyDown['KeyW'] || keyDown['ArrowUp']) {
            controlQueue.push('UP');
        }
        if (keyDown['KeyS'] || keyDown['ArrowDown']) {
            controlQueue.push('DOWN');
        }
        if (keyDown['KeyE']) {
            controlQueue.push('ROTATECW');
        }
        if (keyDown['KeyQ']) {
            controlQueue.push('ROTATECCW');
        }
        return controlQueue;
    }

    return {
        init: setupListeners,
        getQueue: function() {return getQueue()},
        resetQueue: function() {controlQueue = []}
    }
});