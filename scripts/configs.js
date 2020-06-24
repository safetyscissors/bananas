define(function(){
    let canvasSize = {
        w: window.innerWidth,
        h: window.innerHeight
    };
    return {
        fps: 20,
        txFps: 5,
        canvasSize: canvasSize,
        tile: {
            w: 20,
            h: 25,
        },
        pieces: 'aaaaaaaaaaaaaabbbcccddddddeeeeeeeeeeeeeeeeeefffgggghhhiiiiiiiiiiiijjkklllllmmmnnnnnnnnooooooooooopppqqrrrrrrrrrsssssstttttttttuuuuuuvvvwwwxxyyyzz',
        updateSize() {
            canvasSize.w = window.innerWidth;
            canvasSize.h = window.innerHeight;
        },
        room: 'watermelon'
    }
});