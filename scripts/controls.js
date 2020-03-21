define(function() {
    let controlQueue = [];

    function setupListeners(configs, rootDom) {
        document.onkeydown = readControls;
        // document.onkeyup = readControls;
    }

    function readControls(e) {
        let action = '';
        switch(e.code) {
            case 'KeyA':
            case 'ArrowLeft':
                action = 'LEFT';
                break;
            case 'KeyD':
            case 'ArrowRight':
                action = 'RIGHT';
                break;
            case 'KeyW':
            case 'ArrowUp':
                action = 'ROTATECW';
                break;
            case 'KeyS':
            case 'ArrowDown':
                action = 'DROP';
                break;
            case 'Space':
                action = 'FASTDROP';
                break;
            case 'Escape':
                action = 'PAUSE';
                break;
        }
        if (controlQueue.indexOf(action) > -1) return;
        controlQueue.push(action);
    }

    return {
        setupListeners: setupListeners,
        getQueue: function() {return controlQueue},
        requestPause: function() {return controlQueue.includes('PAUSE')},
        resetQueue: function() {controlQueue = []}
    }
});