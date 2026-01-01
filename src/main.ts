import Space from './core/Space';
import Ice from './core/Ice';
import Water from './core/Water';
import Clouds from './core/Clouds';
import Land from './core/Land';
import Trees from './core/Trees';
import Farms from './core/Farms';
import City from './core/City';
import Computer from './core/Computer';
import Robots from './core/Robots';
import Energy from './core/Energy';
import SpaceStation from './core/SpaceStation';
import TractorBeam from './core/TractorBeam';
import SpaceDock from './core/SpaceDock';
import Hangar from './core/Hangar';
import Planet from './core/Planet';

import View from './ui/View';
import { decode, encode } from './utils/utils';
import { Game as IGame } from './types';
import EventEmitter from './utils/EventEmitter';

// --- State ---
export let game: Game | null = null;
export let view: View | null = null;
let timer = 0;
let stop = false;
let cometId = 0;

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
    canvasWidth: number = 1200;
    canvasHeight: number = 600;

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

    events: EventEmitter;

    constructor() {
        this.totalLand = 1000;
        this.cash = 100; // Actual default: 100
        this.oxygen = 0;
        this.science = 0; // Actual default: 0
        this.wood = 0;
        this.metal = 0;
        this.power = 0;
        this.canvasWidth = 1200;
        this.canvasHeight = 600;
        this.events = new EventEmitter();
    }

    tick() {
        this.water.waterSpending = 0;
        this.water.gain = 0;
        this.ice.tick();
        this.robots.tick();
        this.computer.tick();
        this.land.soil -= this.farms.updateFarms(this.land.soil);
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

        this.events.emit('tick');
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
            view?.computerView.addComputerRow(i);
            const proc = this.computer.processes[i];
            if (proc) {
                proc.isMoving = false;
                proc.completions = 0;
            }
        }
        view?.clearRobotRows();
        for (let i = 0; i < this.robots.jobs.length; i++) {
            view?.robotsView.addRobotRow(i);
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
        this.events.emit('hangar:updated');
    }
}

// --- Driver ---
function tick() {
    if (stop) {
        return;
    }
    incrementTimer();

    game?.tick();

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
const doWork = new Worker(new URL('./workers/interval.js', import.meta.url).href);
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
    if (view) {
        view.destroy();
    }
    game = new Game();
    view = new View();
    game?.initialize();
    
    // @ts-ignore
    window.game = game;
    // @ts-ignore
    window.view = view;
}

function setInitialView() {
    if (!view) return;
    view.hangarView.updateFull();
    view.spaceDockView.checkUnlocked();
    view.tractorBeamView.checkUnlocked();
    view.spaceStationView.checkUnlocked();
    view.energyView.checkUnlocked();
    view.computerView.checkUnlocked();
    view.robotsView.checkUnlocked();
    view.update();
}


async function load() {
    loadDefaults();
    if (window.localStorage.terrafold2) { // existing savegame
        const decoded = await decode(window.localStorage.terrafold2);
        const toLoad = JSON.parse(decoded);
        if (game) {
            copyObject(toLoad, game);
        }

        const el = document.getElementById('scienceSlider') as HTMLInputElement;
        if (el && game) el.value = game.population.scienceRatio.toString();
        const elFarm = document.getElementById('farmSlider') as HTMLInputElement;
        if (elFarm && game) elFarm.value = game.farms.farmRatio.toString();
    }

    setInitialView();
    view?.refreshLayout();
    recalcInterval(10);
}

const EXCLUDED_PROPERTIES = [
    'text', 'tooltip', 'events', 'canvasWidth', 'canvasHeight', 
    'drawed', 'isMoving', 'transferred', 'foodCreated', 'convertedLand',
    'takeAmount', 'foodEaten', 'popGrowth', 'starving', 'scienceDelta', 'cashDelta',
    'happinessFromTrees', 'happinessFromOxygen', 'happiness', 'rotation',
    'fernsDelta', 'fernsWaterUse', 'smallTreesDelta', 'smallTreesWaterUse', 
    'treesDelta', 'treesWaterUse', 'totalPlants', 'oxygenGain',
    'woodIncome', 'woodSpending', 'metalIncome', 'metalSpending', 'oxygenSpending',
    'waterIncome', 'waterSpending',
    'cashSpending', 'scienceSpending', 'waterFarms', 'waterTrees', 'buyIncome'
];

function copyObject(object: any, toSave: any) {
    for (let property in object) {
        if (Object.prototype.hasOwnProperty.call(object, property) && !EXCLUDED_PROPERTIES.includes(property)) {
            if (typeof object[property] === 'object' && object[property] !== null) {
                if (typeof toSave[property] === 'undefined')
                    toSave[property] = Array.isArray(object[property]) ? [] : {};
                copyObject(object[property], toSave[property]);
            }
            else if (typeof object[property] !== 'function')
                toSave[property] = object[property];
        }
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
// @ts-ignore
window.pauseGame = pauseGame;
