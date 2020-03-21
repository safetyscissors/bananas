define(function() {
    let frame = 0;
    const initAnimation = Array(20);

    return {
        getFrame: function(){return frame},
        setFrame: function(n){frame = n},
        reset: function(){frame = 0},
        tick: function() {++frame},
        initAnimation: initAnimation,
    }
});