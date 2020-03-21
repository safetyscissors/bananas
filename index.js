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
    ], function(logger, configs, states, render) {
        const canvasDom = document.querySelector("canvas");
        const ctx = canvasDom.getContext("2d");

        // setup
        logger.all();
        logger.log('configs:', configs);
        render.setupCtx(ctx, configs);

        // listeners
        window.onresize = configs.updateSize;
        document.querySelector("#test").addEventListener("click", function() {
            states.start();
        });

        // game loop
        setInterval(function() {
            tick(states, configs, logger);
            draw(render, configs);
        }, 1000/configs.fps);
    });
}

function tick(states, logger) {
    for (let module of arguments) {
        if (module.tick) module.tick();
    }
    if (states.hasStateChanged()) {
        logger.log(states.getStateName());
    }
}

function draw(render, configs) {
    render.resize(configs.canvasSize);
}
