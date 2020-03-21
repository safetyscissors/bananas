define(function() {
    let grid = [];
    let exportGrid = [];
    let partnerGrid = [];
    let tempGrid = [];
    let rowClearAnimationStep = 0;
    let rowClearAnimationFlashTicks = 3;
    let rowClearAnimationColor = '#999';
    let tileSize = 20;
    let newPiece = false;
    let gameOver = false;
    let gridOrPieceUpdated = false;

    const colors = [
        '#b54542',
        '#BB4AA0',
        '#C0A24E',
        '#53C46E',
        '#5875C9',
        '#5D7ACD',
        '#6c59d1'];

    function setupGrid(configs) {
        grid = [];
        gameOver = false;
        gridOrPieceUpdated = false;
        tileSize = configs.tileWidth;
        for(let i = 0; i < configs.rows; i++) {
            grid[i] = new Array(configs.cols);
        }
        exportGrid = grid;
    }

    function render(ctx) {
        for(let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                if (grid[i][j] !== undefined && grid[i][j] !== null) {
                    // animate line clear
                    if (grid[i][j] < 0) {
                        ctx.fillStyle = (Math.floor(rowClearAnimationStep / rowClearAnimationFlashTicks) % 2 === 1) ? '#FFF' : rowClearAnimationColor;
                        // normal rendering
                    } else {
                        ctx.fillStyle = colors[grid[i][j]];
                    }
                    ctx.fillRect(j * tileSize, i * tileSize, tileSize, tileSize);
                }

                // partner grid
                if (partnerGrid[i] && partnerGrid[i][j] !== undefined && partnerGrid[i][j] !== null) {
                    ctx.fillStyle = colors[partnerGrid[i][j]];
                    ctx.fillRect(500 + j * tileSize, i * tileSize, tileSize, tileSize);
                }
            }
        }
        rowClearAnimationStep++;
    }

    function safeInsertPiece(position, row, col, id, _grid) {
        gridOrPieceUpdated = true;
        if (collisionCheck(position, row + 1, col)) {
            if (collisionCheck(position, row, col)) {
                // game over
                gameOver = true;
            }
            insertPiece(position, row, col, id, _grid)
            newPiece = true;
            return true;
        }
        return false;
    }

    function insertPiece(position, row, col, id, _grid) {
        for (let i = 0; i < position.length; i++) {
            for (let j = 0; j < position[i].length; j++) {
                if (position[i][j] !== 1) continue;
                _grid[row + i][col + j] = id;
            }
        }
    }

    function collisionCheck(position, row, col) {
        for (let i = 0; i < position.length; i++) {
            // if no tiles on this position row, skip.
            if (position[i].length === 0) continue;
            // collision if row is outside the grid.
            if (row + i > 20 - 1) return true;
            // check every tile does not overlap
            for (let j = 0; j < position.length; j++) {
                if (position[i][j] !== 1) continue;
                // check if col is outside the grid.
                if (col + j < 0 || col + j > 10 - 1) return true;
                const cell = grid[row + i][col + j];
                if (cell !== undefined && cell !== null) return true;
            }
        }
        return false;
    }

    function update() {
        // check for line clear
        if (newPiece) {
            // check for cleared lines
            for (let [i, row] of grid.entries()) {
                let everyCellHasATile = !row.includes(undefined);
                if (everyCellHasATile) {
                    rowClearAnimationStep = 0;
                    for (let [j, cell] of row.entries()) {
                        grid[i][j] = -1;
                    }
                }
            }
            exportGrid = grid;
        }
        // check for line removal
        if (rowClearAnimationStep === 6) {
            let newGrid = [];
            for (let [i, row] of grid.entries()) {
                if (!row.includes(-1)) {
                    newGrid.push(row);
                } else {
                    newGrid.unshift(new Array(row.length));
                }
            }
            grid = newGrid;
            exportGrid = grid;

        }
        newPiece = false;
    }

    function getExportGrid(pusher, activePiece) {
        if (!gridOrPieceUpdated) return;
        gridOrPieceUpdated = false;
        tempGrid = JSON.parse(JSON.stringify(exportGrid));
        if (activePiece && activePiece.data) {
            insertPiece(
                activePiece.data.positions[activePiece.rotation],
                activePiece.row,
                activePiece.col,
                activePiece.data.id,
                tempGrid);
        }
        pusher.sendGrid(tempGrid);
    }

    return {
        setupGrid: setupGrid,
        getGrid: function() {return grid},
        getExportGrid: getExportGrid,
        getCols: function() {return grid[0].length},
        isGameOver: function() {return gameOver},
        log: function(logger) {logger.log(grid)},
        update: update,
        collisionCheck: collisionCheck,
        safeInsertPiece: safeInsertPiece,
        render: render,
        setPartnerGrid: function(grid) {partnerGrid = grid},
    }
});