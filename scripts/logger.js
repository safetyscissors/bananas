define(function() {
    const LEVELS = {
        ALL: 0,
        WARN: 1,
        OFF: 2
    };
    let logLevel = LEVELS.OFF;
    return {
        log(...msg) {
            if (logLevel <= LEVELS.ALL) {
                console.log(...msg);
            }
        },
        all() {logLevel = LEVELS.ALL},
        warn() {logLevel = LEVELS.WARN},
        off() {logLevel = LEVELS.OFF}
    }
});