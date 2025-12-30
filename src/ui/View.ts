import { game, clearSave, begForMoney, save, exportSave, importSave, pauseGame } from '../main';
import { intToString, intToStringNegative, round1, round2, getClickAmount } from '../utils/utils';
import ProgressBar from './ProgressBar';
import updateSpace from './spaceView';
import ComputerView from './ComputerView';
import RobotsView from './RobotsView';
import ResourceView from './ResourceView';
import IceView from './IceView';
import WaterView from './WaterView';
import CloudsView from './CloudsView';
import LandView from './LandView';
import PopulationView from './PopulationView';
import TreesView from './TreesView';
import FarmsView from './FarmsView';
import EnergyView from './EnergyView';
import SpaceStationView from './SpaceStationView';
import TractorBeamView from './TractorBeamView';
import SpaceDockView from './SpaceDockView';
import HangarView from './HangarView';
import BaseView from './BaseView';
// import { processesView } from '../core/Computer';
import { Comet } from '../types';

export default class View extends BaseView {
    progressBar1: ProgressBar;
    progressBar2: ProgressBar;
    computerView: ComputerView;
    robotsView: RobotsView;
    resourceView: ResourceView;
    iceView: IceView;
    waterView: WaterView;
    cloudsView: CloudsView;
    landView: LandView;
    populationView: PopulationView;
    treesView: TreesView;
    farmsView: FarmsView;
    energyView: EnergyView;
    spaceStationView: SpaceStationView;
    tractorBeamView: TractorBeamView;
    spaceDockView: SpaceDockView;
    hangarView: HangarView;
    private cometPool: HTMLElement[] = [];

    constructor() {
        super();
        this.progressBar1 = new ProgressBar('nextStormProgress', '#21276a');
        this.progressBar2 = new ProgressBar('stormDurationProgress', '#1c7682');
        this.computerView = new ComputerView();
        this.robotsView = new RobotsView();
        this.resourceView = new ResourceView();
        this.iceView = new IceView();
        this.waterView = new WaterView();
        this.cloudsView = new CloudsView();
        this.landView = new LandView();
        this.populationView = new PopulationView();
        this.treesView = new TreesView();
        this.farmsView = new FarmsView();
        this.energyView = new EnergyView();
        this.spaceStationView = new SpaceStationView();
        this.tractorBeamView = new TractorBeamView();
        this.spaceDockView = new SpaceDockView();
        this.hangarView = new HangarView();

        game?.events.on('tick', () => {
            if (!document.hidden) this.update();
        });
    }

    update() {
        if (!game) return;
        // should run no more than once per frame
        this.resourceView.update();
        this.iceView.update();
        this.waterView.update();
        this.cloudsView.update();
        this.landView.update();
        this.treesView.update();
        this.farmsView.update();
        this.populationView.update();
        this.updateComputerRowProgress();
        this.computerView.update();
        this.robotsView.update();
        this.updateRobotsRowProgress();
        this.energyView.update();
        this.spaceStationView.update();
        this.tractorBeamView.update();
        this.spaceDockView.update();
        this.hangarView.update();
        this.progressBar1.tick(game.clouds.initialStormTimer - game.clouds.stormTimer, game.clouds.initialStormTimer);
        this.progressBar2.tick(game.clouds.stormDuration, game.clouds.initialStormDuration);
        updateSpace();
    }

    clearComputerRows() {
        this.getElement('computerRows').innerHTML = '';
    }

    clearRobotRows() {
        this.getElement('robotRows').innerHTML = '';
    }

    updateComputerRowProgress() {
        if (!game || !game.computer.unlocked) return;
        for (let i = 0; i < game.computer.processes.length; i++) {
            this.computerView.updateRowProgress(i);
        }
    }

    updateRobotsRowProgress() {
        if (!game) return;
        for (let i = 0; i < game.robots.jobs.length; i++) {
            this.robotsView.updateRowProgress(i);
        }
    }

    drawComet(cometData: Comet) {
        let cometDiv: HTMLElement | null;
        const cometDivName = 'comet' + cometData.id;
        if (!cometData.drawed) {
            cometDiv = this.cometPool.pop() || document.createElement("div");
            cometDiv.className = cometData.name.toLowerCase();
            cometDiv.id = cometDivName;
            cometDiv.style.display = "block";

            const totalDistance = cometData.speed * cometData.duration;
            cometData.startingY = Math.random() * (totalDistance * .4) + totalDistance * .1;

            cometData.left = 0;
            cometData.top = cometData.endingX = Math.pow(Math.pow(totalDistance, 2) - Math.pow(cometData.startingY, 2), .5); //c^2 = a^2 + b^2, a = sqrt(c^2 - b^2)
            //y = mx + b, m = (y-b)/x
            cometData.slope = (0 - cometData.startingY) / (cometData.endingX);
            this.getElement('cometsContainer').appendChild(cometDiv);
            cometData.drawed = true;
        }
        else
            cometDiv = document.getElementById(cometDivName);
        
        if (cometDiv) {
            cometData.left = (cometData.initialDuration - cometData.duration) / cometData.initialDuration * cometData.endingX;
            cometData.top = cometData.slope * cometData.left + cometData.startingY;

            const effectiveAmount = cometData.amountType === 'ice' ? cometData.amount / 1000 : cometData.amount;
            const baseSize = cometData.name === "Comet" ? 40 : 20;
            const size = baseSize * Math.sqrt(effectiveAmount / 200);

            cometDiv.style.width = Math.round(size) + "px";
            cometDiv.style.height = Math.round(size) + "px";
            cometDiv.style.borderRadius = Math.round(size / 2) + "px";
            cometDiv.style.left = Math.round(cometData.left - size / 2) + "px";
            cometDiv.style.top = Math.round(cometData.top - size / 2) + "px";
        }
    }

    removeComet(cometData: Comet) {
        const cometDivName = 'comet' + cometData.id;
        const cometDiv = document.getElementById(cometDivName);
        if (cometDiv) {
            cometDiv.style.display = "none";
            cometDiv.id = "";
            this.cometPool.push(cometDiv);
            // We keep it in the DOM but hidden, and reuse it later.
        }
        else
            console.log(cometDivName + "not found");
    }
}

// --- Listeners ---
const initListeners = () => {
    const addClick = (id: string, func: (ev: MouseEvent) => any) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', func);
    };

    addClick('btnHardReset', clearSave);
    addClick('btnPause', pauseGame);
    addClick('btnBeg', begForMoney);
    addClick('btnSave', save);
    addClick('btnExport', exportSave);
    addClick('btnImport', importSave);
    addClick('btnBuyIce', () => game?.buyIce());
    addClick('btnBuyFarms', () => game?.buyFarms());
    addClick('unlockComputer', () => game?.computer.unlockComputer());
    addClick('buyThread', () => game?.computer.buyThread());
    addClick('buySpeed', () => game?.computer.buySpeed());
    addClick('unlockRobots', () => game?.robots.unlockRobots());
    addClick('failRobots', () => game?.robots.failedRobots());
    addClick('unlockEnergy', () => game?.energy.unlockEnergy());
    addClick('btnBuyBattery', () => game?.buyBattery());
    addClick('unlockSpaceStation', () => game?.spaceStation.unlockSpaceStation());
    addClick('unlockTractorBeam', () => game?.tractorBeam.unlockTractorBeam());
    addClick('btnBuyBattleship', () => game?.buyBattleship());
    addClick('btnBuyHangar', () => game?.buyHangar());

    const mainContainer = document.getElementById('mainContainer');
    if (mainContainer) {
        mainContainer.addEventListener('contextmenu', e => e.preventDefault());
    }

    const scienceSlider = document.getElementById('scienceSlider') as HTMLInputElement;
    if (scienceSlider) {
        scienceSlider.addEventListener('input', function (this: HTMLInputElement) {
            if (game) game.population.scienceRatio = Number(this.value);
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initListeners);
} else {
    initListeners();
}

// --- Hotkeys ---
const myKeyQueue: {key: number, shift: boolean}[] = [];
function processKeyQueue() {
    if (myKeyQueue.length === 0) return;
    const key = myKeyQueue[0]?.key;
    // var shift = myKeyQueue[0].shift;
    myKeyQueue.splice(0, 1);
    if (key === 66) { //b
        game?.buyIce()
    }
}

document.addEventListener("keydown", function (e) {
    const code = { key: (e.charCode !== 0 ? e.charCode : e.keyCode), shift: e.shiftKey };
    myKeyQueue.push(code);
    processKeyQueue();
});

const keys: Record<number, number> = { 32: 1, 37: 1, 38: 1, 39: 1, 40: 1 };

function preventDefault(e: any) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;
}

function preventDefaultForScrollKeys(e: KeyboardEvent) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
    return true;
}

function disableScroll() {
    // @ts-ignore
    document.onkeydown = preventDefaultForScrollKeys;
}
disableScroll();


const backgroundGrid = document.getElementById('mainContainer');
let rclickStartingPoint: {x: number, y: number} | undefined;

if (backgroundGrid) {
    backgroundGrid.onmousedown = function (e: MouseEvent) {
        if ((e.which && e.which === 3) || (e.buttons && e.buttons === 2)) { //Right click
            rclickStartingPoint = { x: e.pageX, y: e.pageY };
        }
    };

    backgroundGrid.onmousemove = function (e: MouseEvent) {
        if ((e.which && e.which === 3) || (e.buttons && e.buttons === 2)) {
            const dragToPoint = { x: e.pageX, y: e.pageY };
            if (rclickStartingPoint) {
                const offsetx = Math.ceil((dragToPoint.x - rclickStartingPoint.x) / 1.5);
                const offsety = Math.ceil((dragToPoint.y - rclickStartingPoint.y) / 1.5);
                window.scrollBy(offsetx, offsety);
                rclickStartingPoint = dragToPoint;
            }
        }
    };

    backgroundGrid.onmouseup = function (e: MouseEvent) {
        if ((e.which && e.which === 3) || (e.buttons && e.buttons === 2)) {
            return;
        }
    };
}