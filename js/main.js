/* MineSweeper */
'use strict'
var gBoard = [];
var gLevel = 0;
var gLevels = [
    { SIZE: 4, MINES: 2 },
    { SIZE: 6, MINES: 5 },
    { SIZE: 8, MINES: 15 }];
var gState = {
    isGameOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    curLevel: 0
};
var gGameInterval;

initGame();

// set random mines
function initMines(board,i,j) {
    var cntMines = 0;
    var numOfMines = gLevels[gState.curLevel].MINES;
    while (cntMines < numOfMines) {
        var row = getRandomIntInclusive(0, board.length - 1);
        var col = getRandomIntInclusive(0, board.length - 1);
        // if start cell
        if (row === i && col === j) continue;
        var cell = board[row][col];
        if (!cell.isMine) {
            cell.isMine = true;
            cntMines++;
            console.log(row, col);
        }
    }

    return board;
}

// build minesweeper board
function buildBoard() {
    var board = [];
    var level = gLevels[gState.curLevel];
    var cntMines = 0;
    for (var i = 0; i < level.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < level.SIZE; j++) {
            board[i][j] = { isMine: false, MineNegCnt: 0, isFlagged: false };
        }
    }
    return board;
}

// update seconds counter
function updateShownCount(count) {
    var elCount = document.querySelector('.count');
    elCount.innerText = '' + count;
}

// render board to DOM
function renderBoard(board) {
    buildBoardHeader(board);
    // build board cells
    var elBoard = document.querySelector('.board');
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board.length; j++) {
            var strId = 'cell-' + i + '-' + j;
            strHTML += '<td class = "cell" id="' + strId + '" onclick="cellClicked(this,' + i + ',' + j + ')"' +
                ' onmousedown="cellFlagged(this,' + i + ',' + j + ')""' +
                '></td>';
        }
        strHTML += '</tr>';
    }
    elBoard.innerHTML = strHTML;
}

// build board header
function buildBoardHeader(board) {
    var elSmily = document.querySelector('.smily');
    elSmily.colSpan = board.length - 2;
    var elSmilyBtn = document.querySelector('.smily-btn');
    elSmilyBtn.innerText = '😃';
    updateShownCount(gState.shownCount);
    updTime();
}


// process when cell is clicked
function cellClicked(elCell, i, j) {
    if (gState.isGameOn) {
        // build board data on first click
        if (!gState.markedCount){
            initMines(gBoard,i,j);
            setMinesNegsCount(gBoard);        
        }
        if (!gBoard[i][j].isFlagged) {
            if (gBoard[i][j].isMine) {
                elCell.classList.add('mine','mark');
            } else {
                elCell.classList.add(getNumClass(gBoard[i][j].MineNegCnt));
                if (!elCell.classList.contains('mark')) {
                    elCell.classList.add('mark');
                    if (gState.markedCount === 0) gGameInterval = setInterval(updTime, 1000);
                    gState.markedCount++;
                    expandShown(gBoard, i, j);
                }
            }
            checkGameOver(i, j);
        }
    }
}

// get class by value
function getNumClass(num) {
    var numToWords = ['empty', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
    return numToWords[num];

}

// update seconds element
function updTime() {
    var elTime = document.querySelector('.time');
    elTime.innerText = gState.secsPassed++;
}

// initialize game
function initGame() {
    gState.isGameOn = true;
    gState.curLevel = gLevel;
    gState.shownCount = gLevels[gState.curLevel].MINES
    gState.secsPassed = 0;
    gState.markedCount = 0;
    gBoard = buildBoard();
    renderBoard(gBoard);
    clearInterval(gGameInterval);
}

// process when cell is flagged
function cellFlagged(elCell, i, j) {
    if (gState.isGameOn && !elCell.classList.contains('mark')) {
        var isRightClick;
        var winEvent = window.event;
        isRightClick = (winEvent.which && winEvent.which == 3) || (winEvent.button && winEvent.button == 2);
        if (isRightClick) {
            var cell = gBoard[i][j];
            if (gState.shownCount && !cell.isFlagged) {
                cell.isFlagged = true;
                elCell.classList.add('flag');
                gState.shownCount--;
            } else {
                if (cell.isFlagged) gState.shownCount++;
                cell.isFlagged = false;
                elCell.classList.remove('flag');

            }
            updateShownCount(gState.shownCount)
        }
    }
}

// update button
function changeLevel(level) {
    if (+level !== gState.curLevel) {
        gLevel = +level;
        initGame();
    }
}

// create board with neighbours count
function setMinesNegsCount(board) {
    var newBoard = [];
    for (var i = 0; i < board.length; i++) {
        newBoard[i] = [];
        for (var j = 0; j < board.length; j++) {
            newBoard[i][j] = board[i][j];
            // if not a mine
            if (!newBoard[i][j].isMine) {
                var rowIdxStart = Math.max(0, i - 1);
                var rowIdxEnd = Math.min(i + 1, board.length - 1);
                var coldxStart = Math.max(0, j - 1);
                var colIdxEnd = Math.min(j + 1, board.length - 1);
                var sum = sumMines(board, rowIdxStart, rowIdxEnd, coldxStart, colIdxEnd);
                newBoard[i][j].MineNegCnt = sum;
            }
        }
    }
    return newBoard;
}

// check game is over
function checkGameOver(i, j) {
    // clicked a mine
    if (gBoard[i][j].isMine) {
        gameOver('😣');
        showAllMines();
        // only mines left on board
    } else if (gState.markedCount >= gLevels[gState.curLevel].SIZE ** 2 - gLevels[gState.curLevel].MINES) {
        gameOver('😎');
    }
}

// update game state on game over
function gameOver(symbol) {
    var elSmilyBtn = document.querySelector('.smily-btn');
    elSmilyBtn.innerText = symbol;
    gState.isGameOn = false;
    clearInterval(gGameInterval);
}

// show all mines on board
function showAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) {
                var elNextCell = getCellByCoord(i, j);
                elNextCell.classList.add('mine');
            }
        }
    }
}

// sum mines on board in defined index
function sumMines(mat, rowIdxStart, rowIdxEnd, coldxStart, colIdxEnd) {
    var sum = 0;
    for (var i = rowIdxStart; i <= rowIdxEnd; i++) {
        for (var j = coldxStart; j <= colIdxEnd; j++) {
            sum += mat[i][j].isMine;
        }
    }

    return sum;
}

// build cell selector
function getSelector(coord) {
    return '#cell-' + coord.i + '-' + coord.j;
}

// expand board on empty cell
function expandShown(board, i, j) {
    if (gState.isGameOn && gBoard[i][j].MineNegCnt === 0) {
        var rowStartIdx = Math.max(0, i - 1);
        var rowEndIdx = Math.min(board.length - 1, i + 1);
        var colStartIdx = Math.max(0, j - 1);
        var colEndIdx = Math.min(board.length - 1, j + 1);
        for (var row = rowStartIdx; row <= rowEndIdx; row++) {
            for (var col = colStartIdx; col <= colEndIdx; col++) {
                var cell = board[row][col];
                if (!cell.isFlagged && !cell.isMine) {
                    var elNextCell = getCellByCoord(row, col);
                    if (elNextCell.classList.contains('mark') || (row === i && col === j)) continue;
                    elNextCell.classList.add(getNumClass(cell.MineNegCnt), 'mark');
                    gState.markedCount++;
                    if (cell.MineNegCnt === 0) {
                        expandShown(board, row, col);
                    }
                }
            }
        }
    }
}

// get cell by coordinations
function getCellByCoord(i, j) {
    var elCell = document.querySelector(getSelector({ i: i, j: j }));
    return elCell;
}
