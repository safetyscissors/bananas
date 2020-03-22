(function() {
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
    ], function(logger, configs, states, render, player, controls) {
        const canvasDom = document.querySelector("canvas");
        const ctx = canvasDom.getContext("2d");

        // setup
        logger.all();
        logger.log('configs:', configs);
        render.init(ctx, configs);
        controls.init();

        // listeners
        window.onresize = configs.updateSize;
        document.querySelector("#test").addEventListener("click", function() {
            states.start();
        });

        // game loop
        setInterval(function() {
            tick(states, logger, controls, player);
            draw(render, configs, player);
        }, 1000/configs.fps);
    });
}

function tick(states, logger, controls, player) {
    for (let module of arguments) {
        if (module.tick) module.tick();
    }
    player.move(controls.getQueue());
    controls.resetQueue();
    if (states.hasStateChanged()) {
        logger.log(states.getStateName());
    }
}

function draw(render, configs, player) {
    render.resize(configs.canvasSize);
    render.draw(player.getGlobalPos());
}
