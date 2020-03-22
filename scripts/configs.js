define(function(){
    let canvasSize = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    return {
        fps: 20,
        canvasSize: canvasSize,
        updateSize() {
            canvasSize.width = window.innerWidth;
            canvasSize.height = window.innerHeight;
        }
    }
});