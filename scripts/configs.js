define(function(){
    let canvasSize = {
        width: 640,
        height: 480
    };
    return {
        fps: 10,
        canvasSize: canvasSize,
        updateSize() {
            console.log('asdf');
            canvasSize.width = window.innerWidth;
            canvasSize.height = window.innerHeight;
        }
    }
});