const SVGNAMESCAPEURL = 'http://www.w3.org/2000/svg';
const CELL_INFO = 40;
const INITAL_DIFFICULTY = .5;

let difficulty = INITAL_DIFFICULTY,
    sudokuCore = new SudokuCore(),
    sudoku = sudokuCore.createBlankCell(sudokuCore.initializeSudoku(), difficulty),
    prevSudoku = copySudoku(sudoku, difficulty),
    cellPosGroup = [],
    currLevel = 0,
    timerID,
    startTime;

let app = document.querySelector('.app'),
    sudokuContainer = document.querySelector('.sudoku-container'),
    sudokuWrap = document.querySelector('.sudoku'),
    sudokuSvg = document.querySelector('#sudoku-svg'),
    btnResetCurr = document.querySelector('.btn-reset-curr'),
    btnNewSudoku = document.querySelector('.btn-new-sudoku'),
    playTimeWrap = document.querySelector('.time'),
    levelsWrap = document.querySelector('.levels'),
    numbersWrap = document.querySelector('.numbers'),
    lineGroup, textGroup;

renderGame();

function renderGame() {
    sudokuSvg.innerHTML = '';
    let sudokuRect = document.createElementNS(SVGNAMESCAPEURL, 'rect');
    sudokuRect.setAttribute('x', 0);
    sudokuRect.setAttribute('y', 0);
    sudokuRect.setAttribute('width', 360);
    sudokuRect.setAttribute('height', 360);
    sudokuRect.setAttribute('style', 'fill: #f7f7f7; stroke-width: 3; stroke: #999');
    sudokuSvg.appendChild(sudokuRect);

    renderSudokuStyle();
    renderSudoku();
    renderPlayTime();
    renderLevels();
    renderNumbers();
    sudokuContainer.classList.remove('s-done');
}

function renderSudokuStyle() {
    lineGroup = document.createElementNS(SVGNAMESCAPEURL, 'g');

    for (let i = 0; i < 9; i++) {
        let lineEle = document.createElementNS(SVGNAMESCAPEURL, 'line'),
            lineEle1 = document.createElementNS(SVGNAMESCAPEURL, 'line');

        lineEle.setAttribute('x1', 0);
        lineEle.setAttribute('y1', CELL_INFO * i + CELL_INFO);
        lineEle.setAttribute('x2', 360);
        lineEle.setAttribute('y2', CELL_INFO * i + CELL_INFO);

        lineEle1.setAttribute('x1', CELL_INFO * i + CELL_INFO);
        lineEle1.setAttribute('y1', 0);
        lineEle1.setAttribute('x2', CELL_INFO * i + CELL_INFO);
        lineEle1.setAttribute('y2', 360);
        
        if (i === 2 || i === 5) {
            lineEle.setAttribute('style', 'stroke-width: 2');
            lineEle1.setAttribute('style', 'stroke-width: 2');
        }
        
        lineGroup.appendChild(lineEle);
        lineGroup.appendChild(lineEle1);
    }
    lineGroup.setAttribute('style', 'stroke: #aaa; stroke-width: 1');
    sudokuSvg.appendChild(lineGroup);
    lineGroup = null;
}

function renderSudoku() {
    textGroup = document.createElementNS(SVGNAMESCAPEURL, 'g');
    textGroup.setAttribute('text-anchor', 'middle');
    textGroup.setAttribute('dominant-baseline', 'middle');
    textGroup.setAttribute('fill', '#36f');
    cellPosGroup = [];
    for (let i = 0; i < LEN; i++) {
        let posGroup = [];
        for (let j = 0; j < LEN; j++) {
            let item = sudoku[i][j],
                x = CELL_INFO * j,
                y = CELL_INFO * i;

            let text = document.createElementNS(SVGNAMESCAPEURL, 'text');
            text.setAttribute('x', (CELL_INFO / 2) + x);
            text.setAttribute('y', (CELL_INFO / 2 + 2) + y);
            text.innerHTML = item;
            posGroup.push({ x: CELL_INFO * j, y: CELL_INFO * i, x1: x + CELL_INFO, y1: y + CELL_INFO, isEditable: typeof item !== 'number' ? true : false });
            item && textGroup.appendChild(text);
        }
        cellPosGroup.push(posGroup);
    }
    sudokuSvg.appendChild(textGroup);
}

sudokuSvg.addEventListener('click', function (e) {
    let offsetX = e.offsetX,
        offsetY = e.offsetY,
        offsetLeft = sudokuWrap.offsetLeft,
        offsetTop = sudokuWrap.offsetTop;
    
    for (let i = 0; i < LEN; i++) {
        for (let j = 0; j < LEN; j++) {
            let item = cellPosGroup[i][j];
            
            if (offsetX > item.x && offsetY > item.y && offsetX < item.x1 && offsetY < item.y1 ) {
                if (item.isEditable) {
                    inputHandler(i, j, offsetLeft + item.x, offsetTop + item.y);
                }
                break;
            }
        }
    }
}, false);

function inputHandler(i, j, eleLeft, eleTop) {
    let inputEle = document.querySelector('.input-ele');

    if (inputEle) {
        inputEle.blur();
    } else {
        inputEle = document.createElement('input');

        inputEle.value = sudoku[i][j] || '';

        inputEle.className = 'input-ele';
        inputEle.style.left = eleLeft + 'px';
        inputEle.style.top = eleTop + 'px';

        inputEle.addEventListener('keydown', function (e) {
            let keyCode = e.keyCode;

            if (keyCode === 8) {
                e.target.value = '';
            }

            if (keyCode === 116) {
                window.location.reload();
            }
        
            if ((keyCode >= 49 && keyCode <= 57) ||
                (keyCode >= 97 && keyCode <= 105)) {
                return;
            } else {
                e.preventDefault();
            }
        }, false);

        inputEle.addEventListener('keyup', function (e) {
            let val = e.target.value;
            val = val && val.slice(val.length - 1);
            sudoku[i][j] = val;
            inputEle.blur();
            drawSudokuCell(i, j);
        }, false);

        inputEle.addEventListener('blur', function () {
            inputEle.remove();
        }, false);

        document.body.appendChild(inputEle);

        setTimeout(() => {
            inputEle.focus();
        }, 0);
    }
}

function copySudoku(sudoku, difficulty) {
    return {
        sudoku: sudoku.map(rows => rows.map(ele => ele)),
        difficulty
    };
}

levelsWrap.addEventListener('click', function (e) {
    let ele = e.target;
    if (ele.tagName === 'LI') {
        let pos = parseInt(ele.dataset.index);
        currLevel = pos;
        difficulty = sudokuCore.levels[pos].difficulty;
        renderLevels();
    }
}, false);

btnResetCurr.addEventListener('click', function () {
    for (let i = 0, levels = sudokuCore.levels, len = levels.length; i < len; i++) {
        if (prevSudoku.difficulty === levels[i].difficulty) {
            currLevel = i;
            break;
        }
    }
    sudoku = copySudoku(prevSudoku.sudoku, prevSudoku.difficulty).sudoku;
    renderGame();
}, false);

btnNewSudoku.addEventListener('click', function () {
    sudoku = sudokuCore.createBlankCell(sudokuCore.initializeSudoku(), difficulty);
    renderGame();
}, false);

function renderPlayTime() {
    clearTimeout(timerID);
    startTime = Date.now();

    (function counterDown() {
        let now = Date.now(),
            timeDiff = now - startTime,
            h = parseInt(timeDiff / 1000 / 60 / 60 % 24),
            m = parseInt(timeDiff / 1000 / 60 % 60),
            s = parseInt(timeDiff / 1000 % 60);
        
        playTimeWrap.innerHTML = `${ !h ? '' : fixZero(h) + ' : ' }${ fixZero(m) } : ${ fixZero(s) }`;

        timerID = setTimeout(counterDown, 1000);
    })();
}

function renderLevels() {
    let levelsHtml = '';
    for (let i = 0, levels = sudokuCore.levels, len = levels.length; i < len; i++) {
        levelsHtml += `<li class="${ currLevel === i ? 's-current' : 'n-current' }" data-index="${ i }">${ levels[i].text }</li>`;
    }
    levelsWrap.innerHTML = levelsHtml;
}

function renderNumbers() {
    let numbersHtml = '';
    for (let i = 1; i <= 9; i++) {
        let numsRes = JSON.stringify(sudoku).match(new RegExp(i, 'g')),
            len = numsRes ? numsRes.length : 0;

        numbersHtml += `<li class="${ len >= LEN ? 's-max' : '' }">${ i }</li>`;
    }
    numbersWrap.innerHTML = numbersHtml;
}

function fixZero(num) {
    return num < 10 ? `0${ num }` : num;
}

function drawSudokuCell(i, j) {
    let text = document.querySelector(`#cell-${ i }-${ j }`);

    if (text) {
        text.innerHTML = sudoku[i][j];
    } else {
        text = document.createElementNS(SVGNAMESCAPEURL, 'text');
        text.setAttribute('id', `cell-${ i }-${ j }`);
        text.setAttribute('x', (CELL_INFO / 2) + cellPosGroup[i][j].x);
        text.setAttribute('y', (CELL_INFO / 2 + 2) + cellPosGroup[i][j].y);
        text.innerHTML = sudoku[i][j];
        textGroup.appendChild(text);
    }
    renderNumbers();

    setTimeout(() => {
        let hasCheckSudoku = sudoku.map(rows => (rows.map(ele => {
        let eleType = typeof ele;
            if (ele && eleType === 'string') {
                return parseInt(ele);
            }
            return ele;
        })));
        if (sudokuCore.checkSudoku(hasCheckSudoku)) {
            cellPosGroup = cellPosGroup.map(rows => (rows.map(ele => {
                if (ele.isEditable) {
                    ele.isEditable = false;
                }
                return ele;
            })));
            clearTimeout(timerID);
            sudokuContainer.classList.add('s-done');
        }
    }, 0);
}