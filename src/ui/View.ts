import { game, view, clearSave, begForMoney, save, exportSave, importSave, pauseGame } from '../main';
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

    private allContainers: HTMLElement[] = [];
    private columns: HTMLElement[] = [];
    private lastVisibleCount: number = -1;
    private lastWidth: number = -1;
    private resizeHandler: () => void;

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

        const main = this.getElement('mainContainer');
        // Move all containers back to main before removing columns to avoid losing them
        main.querySelectorAll('.container').forEach(container => main.appendChild(container));
        // Clean up any existing columns from previous View instances
        main.querySelectorAll('.column').forEach(col => col.remove());

        this.allContainers = Array.from(main.querySelectorAll('.container')) as HTMLElement[];
        
        this.resizeHandler = () => this.refreshLayout();
        window.addEventListener('resize', this.resizeHandler);

        if (game) {
            game.events.on('tick', () => {
                if (!document.hidden) this.update();
            });

            // Listen to all events that can change container visibility
            game.events.on('computer:unlocked', () => this.refreshLayout());
            game.events.on('robots:unlocked', () => this.refreshLayout());
            game.events.on('energy:unlocked', () => this.refreshLayout());
            game.events.on('spaceStation:unlocked', () => this.refreshLayout());
            game.events.on('tractorBeam:unlocked', () => this.refreshLayout());
            game.events.on('spaceDock:unlocked', () => this.refreshLayout());
        }
    }

    destroy() {
        window.removeEventListener('resize', this.resizeHandler);
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
        this.robotsView.update();
        this.updateRobotsRowProgress();
        this.energyView.update();
        this.spaceStationView.update();
        this.tractorBeamView.update();
        this.hangarView.update();
        this.progressBar1.tick(game.clouds.initialStormTimer - game.clouds.stormTimer, game.clouds.initialStormTimer);
        this.progressBar2.tick(game.clouds.stormDuration, game.clouds.initialStormDuration);
        updateSpace();
    }

    refreshLayout() {
        const main = this.getElement('mainContainer');
        if (main.offsetWidth === 0) return;
        
        // Extract gap and minWidth from computed styles
        const mainStyle = window.getComputedStyle(main);
        const gap = parseFloat(mainStyle.columnGap || mainStyle.gap || '0');
        
        // Measure minWidth by creating a temporary column if none exist
        let minWidth = 280;
        const existingCol = main.querySelector('.column');
        if (existingCol) {
            minWidth = parseFloat(window.getComputedStyle(existingCol).minWidth);
        } else {
            const tempCol = document.createElement('div');
            tempCol.className = 'column';
            tempCol.style.visibility = 'hidden';
            tempCol.style.position = 'absolute';
            main.appendChild(tempCol);
            minWidth = parseFloat(window.getComputedStyle(tempCol).minWidth);
            main.removeChild(tempCol);
        }
        minWidth = Math.max(200, minWidth || 0);

        const containerWidth = minWidth + gap; 
        const currentWidth = main.offsetWidth;
        const numColumns = Math.max(1, Math.floor((currentWidth + gap) / containerWidth));

        const visibleContainers = this.allContainers.filter(c => !c.classList.contains('hidden'));
        const visibleCount = visibleContainers.length;

        // Optimization: skip if nothing changed
        if (this.columns.length === numColumns && 
            visibleCount === this.lastVisibleCount && 
            currentWidth === this.lastWidth) {
            return;
        }

        // Move all containers to mainContainer temporarily to preserve them in DOM
        // This ensures hidden containers stay in the DOM (but not visible)
        for (const container of this.allContainers) {
            main.appendChild(container);
        }

        // Recreate columns if count changed
        if (this.columns.length !== numColumns) {
            this.columns.forEach(col => col.remove());
            this.columns = [];
            for (let i = 0; i < numColumns; i++) {
                const col = document.createElement('div');
                col.className = 'column';
                main.appendChild(col);
                this.columns.push(col);
            }
        }

        this.lastVisibleCount = visibleCount;
        this.lastWidth = currentWidth;

        if (this.columns.length === 0) return;

        // Distribute visible containers
        for (let j = 0; j < visibleContainers.length; j++) {
            const container = visibleContainers[j]!;
            let shortestColumn = this.columns[0]!;
            
            // Heuristic to avoid empty columns: first N items fill first N columns
            if (j < this.columns.length) {
                shortestColumn = this.columns[j]!;
            }
            else {
                let minHeight = shortestColumn.offsetHeight;
                for (let i = 1; i < this.columns.length; i++) {
                    const col = this.columns[i]!;
                    if (col.offsetHeight < minHeight) {
                        shortestColumn = col;
                        minHeight = col.offsetHeight;
                    }
                }
            }

            shortestColumn.appendChild(container);
        }
    }

    clearComputerRows() {
        this.getElement('computerRows').innerHTML = '';
        this.computerView.clearCache();
    }

    clearRobotRows() {
        this.getElement('robotRows').innerHTML = '';
        this.robotsView.clearCache();
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
            cometDiv.classList.remove('hidden');

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
            cometDiv.classList.add('hidden');
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
    addClick('unlockEnergy', () => game?.energy.unlockEnergy());
    addClick('btnBuyBattery', () => game?.buyBattery());
    addClick('unlockSpaceStation', () => game?.spaceStation.unlockSpaceStation());
    addClick('unlockTractorBeam', () => game?.tractorBeam.unlockTractorBeam());
    addClick('btnBuyBattleship', () => game?.buyBattleship());
    addClick('btnBuyHangar', () => game?.buyHangar());

    const mainContainer = document.getElementById('mainContainer');
    mainContainer?.addEventListener('contextmenu', e => e.preventDefault());

    const scienceSlider = document.getElementById('scienceSlider') as HTMLInputElement;
    scienceSlider?.addEventListener('input', function (this: HTMLInputElement) {
        if (game) game.population.scienceRatio = Number(this.value);
    });

    // Sanitize all numeric-input-small to positive integers
    document.querySelectorAll('.numeric-input-small').forEach(el => {
        el.addEventListener('change', function (this: HTMLInputElement) {
            let val = Number(this.value);
            if (isNaN(val) || val < 1) val = 1;
            this.value = Math.floor(val).toString();
            // Trigger input event to update costs
            this.dispatchEvent(new Event('input'));
        });
    });
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
