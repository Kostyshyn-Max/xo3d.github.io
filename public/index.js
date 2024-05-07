class Field {
    constructor(root, socket, room) {
        this.results = new Array(9);
        this.field = new Array(3);
        this.socket = socket;
        for (let i = 0; i < 3; i++) {
            this.field[i] = new Array(3);
            for (let j = 0; j < 3; j++) {
                this.field[i][j] = new Array(3);
                for (let k = 0; k < 3; k++) {
                    this.field[i][j][k] = new Array(3);
                    for (let l = 0; l < 3; l++) {
                        this.field[i][j][k][l] = null;
                    }
                }
            }
        }

        this.fieldEl = root;
        this.room = room;
        for (let i = 0; i < 3; i++) {
            const subFieldRow = document.createElement('div');
            subFieldRow.classList.add('subFieldRow');
            subFieldRow.id = `subfieldrow${i}`;
            this.fieldEl.appendChild(subFieldRow);
            for (let j = 0; j < 3; j++) {
                const subField = document.createElement('div');
                subField.classList.add('subField');
                subField.id = `subfield${i}${j}`;
                subFieldRow.appendChild(subField);
                for (let k = 0; k < 3; k++) {
                    const cellRow = document.createElement('div');
                    cellRow.classList.add('cellRow');
                    cellRow.id = `cellrow${i}${j}${k}`;
                    subField.appendChild(cellRow);
                    for (let l = 0; l < 3; l++) {
                        const cell = document.createElement('button');
                        cell.classList.add('cell');
                        cell.id = `cell${i}${j}${k}${l}`;
                        cell.onclick = () => {
                            this.myTurn = false;
                            if (!this.turn){
                                this.turn = 'X';
                            }
                            this.setCell(i, j, k, l, this.turn);
                            socket.emit('setCell', {room:this.room, i, j, k, l, turn:this.turn});
                        };
                        cell.disabled = true;
                        cellRow.appendChild(cell);
                    }
                }
                const finishPlate = document.createElement('div');
                finishPlate.classList.add('finishPlate');
                finishPlate.id = `finishplate${i}${j}`;
                finishPlate.classList.add('hidden');
                subField.appendChild(finishPlate);
            }
        }
        this.myTurn = false;
    }

    start() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    for (let l = 0; l < 3; l++) {
                        this.field[i][j][k][l] = null;
                        this.fieldEl.querySelector(`#cell${i}${j}${k}${l}`).textContent = '';
                        this.fieldEl.querySelector(`#cell${i}${j}${k}${l}`).disabled = false;
                    }
                }
            }
        }
    }

    stop() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    for (let l = 0; l < 3; l++) {
                        this.fieldEl.querySelector(`#cell${i}${j}${k}${l}`).disabled = true;
                    }
                }
            }
        }
    }

    finishPlate(i, j, turn) {
        const finishPlate = this.fieldEl.querySelector(`#finishplate${i}${j}`);
        finishPlate.classList.remove('hidden');
        finishPlate.textContent = turn;
        this.results[i * 3 + j] = turn;
    }

    checkWin(i, j, k, l, turn) {
        for (let ii = 0; ii < 3; ii++) {
            if (this.field[i][j][k][ii] !== turn) {
                break;
            }
            if (ii === 2) {
                return true;
            }
        }
        for (let ii = 0; ii < 3; ii++) {
            if (this.field[i][j][ii][l] !== turn) {
                break;
            }
            if (ii === 2) {
                return true;
            }
        }
        if (k === l) {
            for (let ii = 0; ii < 3; ii++) {
                if (this.field[i][j][ii][ii] !== turn) {
                    break;
                }
                if (ii === 2) {
                    return true;
                }
            }
        }
        if (k + l === 2) {
            for (let ii = 0; ii < 3; ii++) {
                if (this.field[i][j][ii][2 - ii] !== turn) {
                    break;
                }
                if (ii === 2) {
                    return true;
                }
            }
        }

        for (let ii = 0; ii < 3; ii++) {
            for (let jj = 0; jj < 3; jj++) {
                if (!this.field[i][ii][jj][l]) {
                    break;
                }
                if (jj === 2 && ii === 2) {
                    return null;
                }
            }
        }

        return false;
    }

    win(turn) {
        this.stop();
        this.socket.emit('win', {room:this.room, turn});
        alert(`${turn} wins!`);
    }

    checkMainWin(i, j, turn) {
        for (let ii = 0; ii < 3; ii++) {
            if (this.results[i * 3 + ii] !== turn) {
                break;
            }
            if (ii === 2) {
                win(turn);
                return;
            }
        }
        for (let ii = 0; ii < 3; ii++) {
            if (this.results[ii * 3 + j] !== turn) {
                break;
            }
            if (ii === 2) {
                win(turn);
                return;
            }
        }
        if (i === j) {
            for (let ii = 0; ii < 3; ii++) {
                if (this.results[ii * 3 + ii] !== turn) {
                    break;
                }
                if (ii === 2) {
                    win(turn);
                    return;
                }
            }
        }
        if (i + j === 2) {
            for (let ii = 0; ii < 3; ii++) {
                if (this.results[ii * 3 + 2 - ii] !== turn) {
                    break;
                }
                if (ii === 2) {
                    win(turn);
                    return;
                }
            }
        }

        for (let ii = 0; ii < 3; ii++) {
            for (let jj = 0; jj < 3; jj++) {
                if (!this.results[ii * 3 + jj]) {
                    break;
                }
                if (jj === 2 && ii === 2) {
                    this.win('D');
                    return;
                }
            }
        }
    }

    setCell(i, j, k, l, turn) {
        this.field[i][j][k][l] = turn;
        this.fieldEl.querySelector(`#cell${i}${j}${k}${l}`).textContent = turn;
        this.updateCellDisability(i, j, k, l);
        const res = this.checkWin(i, j, k, l, turn);
        if (res) {
            this.finishPlate(i, j, turn);
        }
        else if (res === null) {
            this.finishPlate(i, j, 'D');
        }
    }

    updateCellDisability(i, j, k, l) {
        for (let ii = 0; ii < 3; ii++) {
            for (let jj = 0; jj < 3; jj++) {
                for (let kk = 0; kk < 3; kk++) {
                    for (let ll = 0; ll < 3; ll++) {
                        const cell = this.fieldEl.querySelector(`#cell${ii}${jj}${kk}${ll}`);
                        if (this.field[ii][jj][kk][ll] !== null || !this.myTurn) {
                            cell.disabled = true;
                        }
                        else if ((!this.results[3*k+l]) && (ii != k || jj != l)) {
                            cell.disabled = true;
                        }
                        else {
                            cell.disabled = false;
                        }
                    }
                }
            }
        }
    }
}

let field;

function initField() {
    var socket = io();
    const room = window.location.search.substring(1).split('&').map(x => x.split('=')).find(x => x[0] === 'room')[1]
    field = new Field(document.getElementById('field'), socket, room);
    socket.emit('join', room)
    socket.on('join', (room) => {
        socket.emit('start', room);
    });
    socket.on('start', () => {
        alert('Game started!');
        field.start();
    });
    socket.on('setCell', ({i, j, k, l, turn}) => {
        field.setCell(i, j, k, l, turn);
        if (!field.turn){
            field.turn = 'O';
        }
        field.myTurn = true;
        field.updateCellDisability(i, j, k, l);
    });
    socket.on('win', ({turn}) => {
        field.win(turn);
    });
}

document.addEventListener('DOMContentLoaded', initField);
