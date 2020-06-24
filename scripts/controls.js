define(function() {
    let keyDown = {};
    let controlQueue = [];
    let mouse = {x: 0, y: 0, changed: false, clicked: false};
    function setupListeners(configs) {
        document.onkeydown = latchKeyDown;
        document.onkeyup = latchKeyUp;
        document.onwheel = scale;
        document.onmousemove = logMousemove;
        document.onclick = logClick;
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

    function logMousemove(e) {
        if (mouse.clicked) return;
        mouse.x = e.clientX || e.pageX;
        mouse.y = e.clientY || e.pageY;
        mouse.changed = true;
    }

    function logClick(e) {
        mouse.x = e.clientX || e.pageX;
        mouse.y = e.clientY || e.pageY;
        mouse.clicked = true;
        mouse.changed = true;
    }

    function tick(cameraPos, canvasSize) {
        if (!mouse.changed && !cameraPos.changed) return;
        mouse.realX = cameraPos.x + Math.cos(cameraPos.a * Math.PI / 180) * (mouse.x - canvasSize.w/2) * cameraPos.z
            + Math.sin(cameraPos.a * Math.PI / 180) * (mouse.y - canvasSize.h/2) * cameraPos.z;
        mouse.realY = cameraPos.y + Math.cos(cameraPos.a * Math.PI / 180) * (mouse.y - canvasSize.h/2) * cameraPos.z
            - Math.sin(cameraPos.a * Math.PI / 180) * (mouse.x - canvasSize.w/2) * cameraPos.z;
        document.getElementById('debug1').innerHTML =`${mouse.x}, ${mouse.y}`;
        document.getElementById('debug2').innerHTML =`${mouse.realX}, ${mouse.realY}`;
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
        if (keyDown['KeyJ']) {
            controlQueue.push('RESET');
        }
        if (keyDown['Digit1']) {
            controlQueue.push('HORIZONTAL');
        }
        if (keyDown['Digit2']) {
            controlQueue.push('VERTICAL');
        }
        return controlQueue;
    }

    return {
        init: setupListeners,
        tick: tick,
        getMouse: function() {return mouse},
        getMouseMoved: function() {return mouse.changed},
        getQueue: function() {return getQueue()},
        resetQueue: function() {controlQueue = []; mouse.changed = false; mouse.clicked = false;}
    }
});