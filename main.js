import Space from './js/classes/Space.js';
import Ice from './js/classes/Ice.js';
import Water from './js/classes/Water.js';
import Clouds from './js/classes/Clouds.js';
import Land from './js/classes/Land.js';
import Trees from './js/classes/Trees.js';
import Farms from './js/classes/Farms.js';
import City from './js/classes/City.js';
import Computer from './js/classes/Computer.js';
import Robots from './js/classes/Robots.js';
import Energy from './js/classes/Energy.js';
import SpaceStation from './js/classes/SpaceStation.js';
import TractorBeam from './js/classes/TractorBeam.js';
import SpaceDock from './js/classes/SpaceDock.js';
import Hangar from './js/classes/Hangar.js';

import View from './js/ui.js';
import { decode, encode } from './js/utils.js';

// --- State ---
export let game = null;
export let view = null;
let timer = 0;
let stop = 0;
let cometId = 0;

function setGame(val) { game = val; }
function setView(val) { view = val; }
function setTimer(val) { timer = val; }
function incrementTimer() { timer++; }
function setStop(val) { stop = val; }
function toggleStop() { stop = !stop; }
function setCometId(val) { cometId = val; }
export function incrementCometId() { cometId++; return cometId; }

// --- Game ---
class Game {
    constructor() {
        this.totalLand = 1000;
        this.cash = 100; //Actual default: 100
        this.oxygen = 0;
        this.science = 0; //Actual default: 0
        this.wood = 0;
        this.metal = 0;
        this.power = 0;
    }

    tick() {
        this.ice.tick();
        this.robots.tick();
        this.computer.tick();
        this.farms.tick(this.land.transferWater());
        this.population.tick();
        this.water.outdoor += this.farms.transferWater();
        this.trees.tick(this.land.transferWater());
        this.water.outdoor += this.trees.transferWater();
        this.land.tick(this.clouds.transferWater());
        this.clouds.tick(this.water.transferWater());
        this.energy.tick();
        this.water.tick(this.ice.transferWater());
        this.tractorBeam.tick();
        this.spaceStation.tick();
        this.space.tick();

        this.oxygenLeak = this.oxygen / 100000;
        this.oxygen -= this.oxygenLeak;
        this.hangar.tick();
    }

    initialize() {
        this.space = new Space();
        this.ice = new Ice();
        this.water = new Water();
        this.clouds = new Clouds();
        this.land = new Land(this.totalLand);
        this.trees = new Trees();
        this.farms = new Farms();
        this.population = new City();
        this.computer = new Computer();
        this.robots = new Robots();
        this.energy = new Energy();
        this.spaceStation = new SpaceStation();
        this.tractorBeam = new TractorBeam();
        this.spaceDock = new SpaceDock();
        this.hangar = new Hangar();


        for (var i = 0; i < this.computer.processes.length; i++) {
            view.addComputerRow(i);
            this.computer.processes[i].isMoving = 0;
            this.computer.processes[i].completions = 0;
        }
        for (i = 0; i < this.robots.jobs.length; i++) {
            view.addRobotRow(i);
            this.robots.jobs[i].completions = 0;
        }
    }

    buyIce() {
        var toBuy = this.cash;
        if (toBuy <= 0) {
            return;
        }
        this.cash -= this.ice.buyIce(toBuy);
    }

    buyFarms() {
        var toBuy = Number(document.getElementById('buyFarmAmount').value);
        if (toBuy * 50 > this.land.soil) {
            toBuy = Math.floor(this.land.soil / 50);
        }
        if (toBuy <= 0) {
            return;
        }
        this.land.soil -= toBuy * 50;
        this.farms.addFarm(toBuy);
        view.update();
    }

    buyBattery() {
        var toBuy = Number(document.getElementById('buyBattery').value);
        if (toBuy * 3e4 > this.oxygen) {
            toBuy = Math.floor(this.oxygen / 3e4);
        }
        if (toBuy * 2e4 > this.science) {
            toBuy = Math.floor(this.science / 2e4);
        }
        if (toBuy <= 0) {
            return;
        }
        this.oxygen -= toBuy * 3e4;
        this.science -= toBuy * 2e4;
        this.energy.buyBattery(toBuy);
        view.update();
    }

    buyBattleship() {
        var toBuy = Number(document.getElementById('buyBattleshipAmount').value);
        if (toBuy * 3e7 > this.oxygen) {
            toBuy = Math.floor(this.oxygen / 3e7);
        }
        if (toBuy * 1.5e7 > this.science) {
            toBuy = Math.floor(this.science / 1.5e7);
        }
        if (toBuy <= 0) {
            return;
        }
        this.oxygen -= 3e7 * toBuy;
        this.science -= 1.5e7 * toBuy;
        this.spaceDock.addBattleship(toBuy);
        view.update();
    }

    buyHangar() {
        const cost = 1000000;
        var toBuy = Number(document.getElementById('buyHangarAmount').value);
        if (toBuy * cost > this.land.soil) {
            toBuy = Math.floor(this.land.soil / cost);
        }
        if (toBuy <= 0) {
            return;
        }
        this.land.soil -= toBuy * cost;
        this.hangar.sendRate += toBuy;
        view.update();
    }
}

// --- Driver ---
function tick() {
    if (stop) {
        return;
    }
    incrementTimer();

    game.tick();
    if (!document.hidden)
        view.update();

    if (timer % 100 === 0) {
        save();
    }
}

function recalcInterval(newSpeed) {
    doWork.postMessage({ stop: true });
    doWork.postMessage({ start: true, ms: (1000 / newSpeed) });
}

export function pauseGame() {
    toggleStop();
}

// --- Saving ---
let doWork = new Worker('./js/interval.js');
doWork.onmessage = function (event) {
    if (event.data === 'interval.start') {
        tick();
    }
};

export function clearSave() {
    window.localStorage.terrafold2 = "";
    load();
}

function loadDefaults() {
    setView(new View());
    setGame(new Game());
    game.initialize();
}

function setInitialView() {
    view.checkSpaceDockUnlocked();
    view.updateSpaceDock();
    view.checkTractorBeamUnlocked();
    view.checkSpaceStationUnlocked();
    view.checkEnergyUnlocked();
    view.updateComputer();
    view.checkComputerUnlocked();
    view.updateRobots();
    view.checkRobotsUnlocked();
}


function load() {
    loadDefaults();
    if (window.localStorage.terrafold2) { //existing savegame
        var toLoad = JSON.parse(decode(window.localStorage.terrafold2));
        copyObject(toLoad, game);

        for (let comet of game.tractorBeam.comets)
            comet.drawed = false;

        document.getElementById('scienceSlider').value = game.population.scienceRatio;
    }

    setInitialView();
    recalcInterval(10);
}

function copyObject(object, toSave) {
    for (var property in object) {
        if (typeof object[property] === 'object') {
            if (typeof toSave[property] === 'undefined')
                toSave[property] = {};
            copyObject(object[property], toSave[property]);
        }
        else if (typeof object[property] !== 'function')
            toSave[property] = object[property];
    }
}

export function save() {
    var toSave = {};
    copyObject(game, toSave)
    window.localStorage.terrafold2 = encode(JSON.stringify(toSave));
}

export function exportSave() {
    save();
    document.getElementById("exportImportSave").value = encode(window.localStorage.terrafold2);
    document.getElementById("exportImportSave").select();
    document.execCommand('copy');
    document.getElementById("exportImportSave").value = "";
}

export function importSave() {
    window.localStorage.terrafold2 = decode(document.getElementById("exportImportSave").value);

    load();
}

export function begForMoney() {
    game.cash += 0.1;
}

function cheat() {
    game.ice.ice = 100000000000
    game.science = 1000000000000
    game.farms.farms = 100000000000
    game.cash = 1000000000000
    game.oxygen = 100000000000000000
    game.wood = 100000000
    game.metal = 100000000
}

// Initialize the game
load();
window.game = game;