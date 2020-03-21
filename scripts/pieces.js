define(function() {
    let activePiece = {};
    let queue = [1];
    let displayGrid = [];

    const ticksPerDrop = 8;
    const ticksPerRotate = 1;
    const ticksPerMove = 1;
    const tileSize = 40;

    let moveCooldown = ticksPerMove;
    let rotateCooldown = ticksPerRotate;
    let dropCooldown = ticksPerDrop;

    let partnerQueue = [1];
    let queueUpdated = false;

    const pieces = [
        { // I
            id: 0,
            positions: [
                [
                    [],
                    [1,1,1,1],
                    [],
                    [],
                ],
                [
                    [,,1],
                    [,,1],
                    [,,1],
                    [,,1],
                ],
                [
                    [],
                    [1,1,1,1],
                    [],
                    [],
                ],
                [
                    [,1],
                    [,1],
                    [,1],
                    [,1],
                ],
            ],
            color: '#B5479B',
        },
        { // L
            id: 1,
            positions: [
                [
                    [],
                    [1,1,1],
                    [1],
                    [],
                ],
                [
                    [1,1],
                    [,1],
                    [,1],
                    [],
                ],
                [
                    [],
                    [,,1],
                    [1,1,1],
                    [],
                ],
                [
                    [1],
                    [1],
                    [1,1],
                    [],
                ],
            ],
            color: '#BB4AA0',
        },
        { // J
            id: 2,
            color: '#C0A24E',
            positions: [
                [
                    [],
                    [1,1,1],
                    [,,1],
                    [],
                ],
                [
                    [,1],
                    [,1],
                    [1,1],
                    [],
                ],
                [
                    [],
                    [1],
                    [1,1,1],
                    [],
                ],
                [
                    [1,1],
                    [1],
                    [1],
                    [],
                ],
            ],
        },
        { // S
            id: 3,
            color: '#53C46E',
            positions: [
                [
                    [],
                    [,1,1],
                    [1,1,],
                    [],
                ],
                [
                    [,1],
                    [,1,1],
                    [,,1],
                    [],
                ],
            ],
        },
        { // Z
            id: 4,
            color: '#5875C9',
            positions: [
                [
                    [],
                    [1,1],
                    [,1,1],
                    [],
                ],
                [
                    [,,1],
                    [,1,1],
                    [,1],
                    [],
                ],
            ],
        },
        { // O
            id: 5,
            color: '#5D7ACD',
            positions: [
                [
                    [],
                    [,1,1],
                    [,1,1],
                    [],
                ],
            ],
        },
        { // T
            id: 6,
            color: '#627FD1',
            positions: [
                [
                    [],
                    [1,1,1],
                    [,1],
                    [],
                ],
                [
                    [,,1],
                    [,1,1],
                    [,,1],
                    [],
                ],
                [
                    [],
                    [,1],
                    [1,1,1],
                    [],
                ],
                [
                    [1,],
                    [1,1],
                    [1],
                    [],
                ],
            ],
        }];

    function render(ctx) {
        if (!activePiece.data) return;
        const position = activePiece.data.positions[activePiece.rotation];
        for(let i = 0; i < position.length; i++) {
            for (let j = 0; j < position[i].length; j++) {
                if (!position[i][j]) continue;
                ctx.fillStyle = activePiece.data.color;
                ctx.fillRect((j + activePiece.col) * tileSize, (i + activePiece.row) * tileSize, tileSize, tileSize);
            }
        }
    }

    function renderAllQueues(ctx) {
        renderQueue(ctx, queue, 410);
        renderQueue(ctx, partnerQueue, 910);
    }

    function renderQueue(ctx, _queue, offset) {
        if (!_queue || !_queue.length) return;
        for (let [queueIndex, pieceId] of _queue.slice().reverse().entries()) {
            const position = pieces[pieceId].positions[0];
            for(let i = 0; i < position.length; i++) {
                for (let j = 0; j < position[i].length; j++) {
                    if (!position[i][j]) continue;
                    ctx.fillStyle = pieces[pieceId].color;
                    const scale = tileSize/4;
                    ctx.fillRect(offset + j * scale, (queueIndex * 30) + i * scale, scale, scale);
                }
            }
        }
    }

    function exportQueue(pusher) {
        if (!queueUpdated) return;
        pusher.sendQueue(queue);
        queueUpdated = false;
    }

    function newActivePiece(id) {
        return {
            id: id,
            data: pieces[id],
            rotation: 0,
            row: 0,
            col: 3,
        };
    }

    function update(grid, controlsQueue) {
        if (!activePiece.data) {
            activePiece = newActivePiece(queue.pop());
            while (queue.length < 5) {
                queue.unshift(Math.floor(Math.random() * 7));
                queueUpdated = true;
            }
        }
        // move piece
        let move = getFirst(controlsQueue, ['LEFT', 'RIGHT', 'DROP', 'FASTDROP']);
        if (move && --moveCooldown <= 0) {
            moveCooldown = ticksPerMove;
            switch(move) {
                case 'LEFT':
                    if (!grid.collisionCheck(
                            activePiece.data.positions[activePiece.rotation],
                            activePiece.row,
                            activePiece.col - 1)) {
                        activePiece.col--;
                    }
                    break;
                case 'RIGHT':
                    if (!grid.collisionCheck(
                            activePiece.data.positions[activePiece.rotation],
                            activePiece.row,
                            activePiece.col + 1)) {
                        activePiece.col++;
                    }
                    break;
                case 'DROP':
                    dropCooldown = ticksPerDrop;
                    if (grid.safeInsertPiece(
                        activePiece.data.positions[activePiece.rotation],
                        activePiece.row,
                        activePiece.col,
                        activePiece.data.id,
                        grid.getGrid())) {
                        activePiece = {};
                        return;
                    } else {
                        activePiece.row += 1;
                    }
                    break;
                case 'FASTDROP':
                    dropCooldown = ticksPerDrop;
                    for (let i = activePiece.row; i < 20; i++) {
                        if (grid.safeInsertPiece(
                            activePiece.data.positions[activePiece.rotation],
                            i,
                            activePiece.col,
                            activePiece.data.id,
                            grid.getGrid())) {
                            activePiece = {};
                            return;
                        }
                    }
                    break;
            }
        }
        // rotate piece
        let rotate = getFirst(controlsQueue, ['ROTATECW']);
        if (rotate && --rotateCooldown <= 0) {
            rotateCooldown = ticksPerRotate;
            const newRotation = (activePiece.rotation + 1) % activePiece.data.positions.length;
            if (!grid.collisionCheck(
                    activePiece.data.positions[newRotation],
                    activePiece.row,
                    activePiece.col)) {
                activePiece.rotation = newRotation;
            }
        }
        // drop piece
        if (--dropCooldown <= 0) {
            dropCooldown = ticksPerDrop;
            if (grid.safeInsertPiece(
                    activePiece.data.positions[activePiece.rotation],
                    activePiece.row,
                    activePiece.col,
                    activePiece.data.id,
                    grid.getGrid())) {
                activePiece = {};
            } else {
                activePiece.row += 1;
            }
        }
    }

    function getFirst(queue, types) {
        if (!queue || !queue.length) return;
        return queue.find(function(action) {return types.indexOf(action) > -1})
    }

    return {
        update: update,
        render: render,
        renderQueue: renderAllQueues,
        exportQueue: exportQueue,
        setPartnerQueue: function(q) {partnerQueue = q},
        getActivePiece: function() {return activePiece;},
        getGrid: function() {return displayGrid;},
        setupActivePiece: function() {activePiece = {}}
    }
});