NX = 5;
NY = 5;

var CELL_DEAD = 0;
var CELL_ALIVE = 1;


class GameOfLifeView {
    constructor(controller, model) {
        this.controller = controller;
        this.model = model;
        this.board = document.getElementById("board");
        for (let i = 0; i < NX; i++) {
            let row = document.createElement("tr");
            board.appendChild(row);
            for (let j = 0; j < NY; j++) {
                let cell = document.createElement("td");
                cell.id = "cell-" + i + "-" + j;
                cell.innerText = "x";
                if (model.cells[i][j].state == CELL_DEAD) {
                    cell.style.backgroundColor = "white";
                    cell.style.color = "white";
                } else {
                    cell.style.backgroundColor = "green";
                    cell.style.color = "green";
                }
                row.appendChild(cell);
            }
        }
        
        this.form = document.getElementById("controls");
        this.fpsFieldset = document.getElementById("fps-fieldset");
        this.fpsFieldset.addEventListener("change", (event) => {
            if (event.target.name == "fps") {
                this.controller.handleFpsChange(event.target.value);
            }
        });
        
        this.icFieldset = document.getElementById("initial-conditions");
        this.icFieldset.addEventListener("change", (event) => {
            this.controller.handleInitialConditionChange(event.target.value);
        });
        
        this.startButton = document.getElementById("startButton");
        this.startButton.addEventListener("click", () => {
            this.controller.handleStart();
        });
        this.stopButton = document.getElementById("stopButton");
        this.stopButton.addEventListener("click", () => {
            this.controller.handleStop();
        });

        this.stepLabel = document.getElementById("stepLabel");

        window.addEventListener("keypress", (event) => {
            if (event.key == " ") {
                this.controller.handleStartStop();
            }
        });

        this._setDefaultFpsValue();
        this._setDefaultInitialCondition();
        
        model.registerObserver(this);
    }
    
    redrawGameStarted() {
        this.startButton.disabled = true;
        this.stopButton.disabled = false;
        this.fpsFieldset.disabled = true;
    }
    
    redrawGameStopped() {
        this.startButton.disabled = false;
        this.stopButton.disabled = true;
        this.fpsFieldset.disabled = false;        
    }
    
    reset() {
        this.stepLabel.innerText = 0;
        for (let i = 0; i < NX; i++) {
            for (let j = 0; j < NY; j++) {
                let cell = document.getElementById("cell-" + i + "-" + j);
                if (this.model.cells[i][j].state == CELL_DEAD) {
                    cell.style.backgroundColor = "white";
                    cell.style.color = "white";
                } else {
                    cell.style.backgroundColor = "green";
                    cell.style.color = "green";
                }
            }
        }
    }
    
    /**
     * Draw cells according to their updated state.
     * @param int step Time step number
     * @param {Array} updatedCells 
     */
    redrawCells(step, updatedCells) {
        
        for (let i = 0; i < updatedCells.length; i++) {
            if (updatedCells[i].state == CELL_ALIVE) {
                let id = "cell-" + updatedCells[i].x + "-" + updatedCells[i].y;
                document.getElementById(id).style.backgroundColor = "green";
                document.getElementById(id).style.color = "green";
            } else if (updatedCells[i].state == CELL_DEAD) {
                let id = "cell-" + updatedCells[i].x + "-" + updatedCells[i].y;
                document.getElementById(id).style.backgroundColor = "white";
                document.getElementById(id).style.color = "white";
            }
        }
        this.stepLabel.innerText = step;
    }
    
    _setDefaultFpsValue() {
        const fps = this.controller.fps;
        
        const fpsRadios = this.form.querySelectorAll('input[name="fps"]');
        
        for (let radio of fpsRadios) {
            if (radio.value != fps && radio.checked) {
                radio.checked = false;
            }
            if (radio.value == fps) {
                radio.checked = true;
            }
        }
    }
    
    _setDefaultInitialCondition() {
        const ic = this.controller.ic;
        const icRadios = this.icFieldset.querySelectorAll('input[name="ic"]');
        
        for (let radio of icRadios) {
            if (radio.value != ic && radio.checked) {
                radio.checked = false;
            }
            if (radio.value == ic) {
                radio.checked = true;
            }
        }
    }
}

class Cell {
    constructor(x, y, state) {
        this.x = x;
        this.y = y;
        this.state = state;
    }
}


class GameOfLifeModel {
    constructor(ic) {
        this.reset(ic);
        this.observers = new Array();
    }
    
    reset(ic) {
        this.cells = [];
        for (let i = 0; i < NX; i++) {
            this.cells[i] = [];
            for (let j = 0; j < NY; j++) {
                this.cells[i][j] = new Cell(i, j, CELL_DEAD);
            }
        }

        if (ic == "still tub") {
            this.cells[1][2].state = CELL_ALIVE;
            this.cells[2][1].state = CELL_ALIVE;
            this.cells[2][3].state = CELL_ALIVE;
            this.cells[3][2].state = CELL_ALIVE;
        }
        else if (ic === "blinker (period 2)") {
            const j = Math.round(NX / 2) - 1;       
            for (let i = 1; i < NY - 1; i++) {
                this.cells[i][j].state = CELL_ALIVE;
            }
        }
        else {
            throw new Error("Unknown value for initial condition");
        }

        this.step = 0;
    }
    
    play() {
        this.step = 0;
        while (true) {

        }
    }
    
    advance() {
        let updatedCells = new Array();
        for (let i = 1; i < NX - 1; i++) {
            for (let j = 1; j < NY - 1; j++) {
                const neighbors = this.cells[i-1][j].state +
                    this.cells[i + 1][j].state +
                    this.cells[i][j - 1].state +
                    this.cells[i][j + 1].state +
                    this.cells[i - 1][j - 1].state +
                    this.cells[i + 1][j - 1].state +
                    this.cells[i - 1][j + 1].state +
                    this.cells[i + 1][j + 1].state;
                if (neighbors < 2) {
                    updatedCells.push(new Cell(i, j, CELL_DEAD));
                }
                else if ((neighbors === 2 || neighbors === 3) && this.cells[i][j].state == CELL_ALIVE) {
                    continue;
                }
                else if (neighbors > 3 && this.cells[i][j].state == CELL_ALIVE) {
                    updatedCells.push(new Cell(i, j, CELL_DEAD));
                }
                else if (neighbors == 3 && this.cells[i][j].state == CELL_DEAD) {
                    updatedCells.push(new Cell(i, j, CELL_ALIVE));
                }
                else {
                    console.log("Could not determine the evolution for a cell");
                }
            }
        }
        
        for (let k = 0; k < updatedCells.length; k++) {
            const cell = updatedCells[k];
            const i = cell.x;
            const j = cell.y;
            const state = cell.state;
            this.cells[i][j].state = state;
        }
        
        this.step += 1;
        this.notifyObservers(this.step, updatedCells);
    }
    
    registerObserver(observer) {
        this.observers.push(observer);
    }
    
    notifyObservers(step, updatedCells) {
        for (let k = 0; k < this.observers.length; k++) {
            this.observers[k].redrawCells(step, updatedCells);
        }
    }
}

class GameOfLifeController {
    constructor() {
        this.fps = 5;
        this.allowed_ic_values = ["still tub", "blinker (period 2)"];
        this.ic = this.allowed_ic_values[0];
        this.hasStarted = false;
        this.model = new GameOfLifeModel(this.ic);
        this.view = new GameOfLifeView(this, this.model);
        
        this.requestId = null;
    }
    
    handleStart() {
        this.hasStarted = true;
        this.view.redrawGameStarted();
        if (this.requestId) {
            return;
        }
        let time = null;
        let delay = 1000 / this.fps;
        let frameNumber = 0;
        const step = (timestamp) => {
            if (time === null) {
                time = timestamp;
            }
            let passed = Math.floor((timestamp - time) / delay);
            if (passed > frameNumber) {
                frameNumber = passed;
                this.model.advance();
            }
            this.requestId = window.requestAnimationFrame(step);
        }
        this.requestId = window.requestAnimationFrame(step);
    }
    
    handleStop() {
        if (this.requestId) {
            window.cancelAnimationFrame(this.requestId);
        }
        this.requestId = null;
        this.model.reset(this.ic);
        this.view.redrawGameStopped();
        this.hasStarted = false;
    }
    
    handleStartStop() {
        if (this.hasStarted) {
            this.handleStop();
        }
        else {
            this.handleStart();
        }
    }

    handleFpsChange(newFps) {
        newFps = parseInt(newFps);
        this.fps = newFps;
    }
    
    handleInitialConditionChange(ic) {
        if (! this.allowed_ic_values.includes(ic)) {
            this.view.renderNotAllowedIcValue(ic, this.allowed_ic_values);
        }
        
        this.ic = ic;
        this.model.reset(this.ic);
        this.view.reset();
    }
}

function initGame() {
    controller = new GameOfLifeController();
}