import Space from './js/classes/Space';
import Ice from './js/classes/Ice';
import Water from './js/classes/Water';
import Clouds from './js/classes/Clouds';
import Land from './js/classes/Land';
import Trees from './js/classes/Trees';
import Farms from './js/classes/Farms';
import City from './js/classes/City';
import Computer from './js/classes/Computer';
import Robots from './js/classes/Robots';
import Energy from './js/classes/Energy';
import SpaceStation from './js/classes/SpaceStation';
import TractorBeam from './js/classes/TractorBeam';
import SpaceDock from './js/classes/SpaceDock';
import Hangar from './js/classes/Hangar';

import View from './js/ui';
import { decode, encode } from './js/utils';
import { Game as IGame } from './js/types';

// --- State ---
export let game: Game | null = null;
export let view: View | null = null;
let timer = 0;
let stop = false;
let cometId = 0;

function setGame(val: Game) { game = val; }
function setView(val: View) { view = val; }
function incrementTimer() { timer++; }
function toggleStop() { stop = !stop; }
export function incrementCometId() { cometId++; return cometId; }

// --- Game ---
class Game implements IGame {
    totalLand: number;
    cash: number;
    oxygen: number;
    science: number;
    wood: number;
    metal: number;
    power: number;
    oxygenLeak: number = 0;

    space!: Space;
    ice!: Ice;
    water!: Water;
    clouds!: Clouds;
    land!: Land;
    trees!: Trees;
    farms!: Farms;
    population!: City;
    computer!: Computer;
    robots!: Robots;
    energy!: Energy;
    spaceStation!: SpaceStation;
    tractorBeam!: TractorBeam;
    spaceDock!: SpaceDock;
    hangar!: Hangar;

    constructor() {
        this.totalLand = 1000;
        this.cash = 100; // Actual default: 100
        this.oxygen = 0;
        this.science = 0; // Actual default: 0
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

        view?.clearComputerRows();
        for (let i = 0; i < this.computer.processes.length; i++) {
            view?.addComputerRow(i);
            const proc = this.computer.processes[i];
            if (proc) {
                proc.isMoving = 0;
                proc.completions = 0;
            }
        }
        view?.clearRobotRows();
        for (let i = 0; i < this.robots.jobs.length; i++) {
            view?.addRobotRow(i);
            const job = this.robots.jobs[i];
            if (job) {
                job.completions = 0;
            }
        }
    }

    buyIce() {
        let toBuy = this.cash;
        if (toBuy <= 0) {
            return;
        }
        this.cash -= this.ice.buyIce(toBuy);
    }

    buyFarms() {
        const el = document.getElementById('buyFarmAmount') as HTMLInputElement;
        let toBuy = Number(el.value);
        if (toBuy * 50 > this.land.soil) {
            toBuy = Math.floor(this.land.soil / 50);
        }
        if (toBuy <= 0) {
            return;
        }
        this.land.soil -= toBuy * 50;
        this.farms.addFarm(toBuy);
        view?.update();
    }

    buyBattery() {
        const el = document.getElementById('buyBattery') as HTMLInputElement;
        let toBuy = Number(el.value);
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
        view?.update();
    }

    buyBattleship() {
        const el = document.getElementById('buyBattleshipAmount') as HTMLInputElement;
        let toBuy = Number(el.value);
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
        view?.update();
    }

    buyHangar() {
        const cost = 1000000;
        const el = document.getElementById('buyHangarAmount') as HTMLInputElement;
        let toBuy = Number(el.value);
        if (toBuy * cost > this.land.soil) {
            toBuy = Math.floor(this.land.soil / cost);
        }
        if (toBuy <= 0) {
            return;
        }
        this.land.soil -= toBuy * cost;
        this.hangar.sendRate += toBuy;
        view?.update();
    }
}

// --- Driver ---
function tick() {
    if (stop) {
        return;
    }
    incrementTimer();

    game?.tick();
    if (!document.hidden)
        view?.update();

    if (timer % 100 === 0) {
        save();
    }
}

function recalcInterval(newSpeed: number) {
    doWork.postMessage({ stop: true });
    doWork.postMessage({ start: true, ms: (1000 / newSpeed) });
}

export function pauseGame() {
    toggleStop();
}

// --- Saving ---
const doWork = new Worker(new URL('./js/interval.js', import.meta.url).href);
doWork.onmessage = function (event) {
    if (event.data === 'interval.start') {
        tick();
    }
};

export async function clearSave() {
    window.localStorage.terrafold2 = "";
    await load();
}

function loadDefaults() {
    setView(new View());
    setGame(new Game());
    game?.initialize();
}

function setInitialView() {
    if (!view) return;
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


async function load() {
    loadDefaults();
    if (window.localStorage.terrafold2) { // existing savegame
        const decoded = await decode(window.localStorage.terrafold2);
        const toLoad = JSON.parse(decoded);
        if (game) copyObject(toLoad, game);

        if (game) {
            for (let comet of game.tractorBeam.comets)
                comet.drawed = false;
        }

        const el = document.getElementById('scienceSlider') as HTMLInputElement;
        if (el && game) el.value = game.population.scienceRatio.toString();
    }

    setInitialView();
    recalcInterval(10);
}

function copyObject(object: any, toSave: any) {
    for (let property in object) {
        if (typeof object[property] === 'object' && object[property] !== null) {
            if (typeof toSave[property] === 'undefined')
                toSave[property] = {};
            copyObject(object[property], toSave[property]);
        }
        else if (typeof object[property] !== 'function')
            toSave[property] = object[property];
    }
}

export async function save() {
    let toSave = {};
    if (game) copyObject(game, toSave)
    window.localStorage.terrafold2 = await encode(JSON.stringify(toSave));
}

export async function exportSave() {
    await save();
    const el = document.getElementById("exportImportSave") as HTMLTextAreaElement;
    if (el) {
        el.value = await encode(window.localStorage.terrafold2 || "");
        el.select();
        document.execCommand('copy');
        el.value = "";
    }
}

export async function importSave() {
    const el = document.getElementById("exportImportSave") as HTMLTextAreaElement;
    if (el) {
        window.localStorage.terrafold2 = await decode(el.value);
        await load();
    }
}

export function begForMoney() {
    if (game) game.cash += 0.1;
}

// Initialize the game
load();
// @ts-ignore
window.game = game;
// @ts-ignore
window.view = view;
