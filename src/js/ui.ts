import { game, clearSave, begForMoney, save, exportSave, importSave, pauseGame } from '../main';
import { intToString, intToStringNegative, round1, round2, getClickAmount } from './utils';
import ProgressBar from './UIClasses/ProgressBar';
import updateSpace from './UIClasses/spaceView';
import { processesView } from './classes/Computer';
import { jobsView } from './classes/Robots';
import { Comet } from './types';

export default class View {
    progressBar1: ProgressBar;
    progressBar2: ProgressBar;
    private textCache: Map<string, string> = new Map();
    private cometPool: HTMLElement[] = [];

    constructor() {
        this.progressBar1 = new ProgressBar('nextStormProgress', '#21276a');
        this.progressBar2 = new ProgressBar('stormDurationProgress', '#1c7682');
    }

    private updateElementText(id: string, value: string | number) {
        const strValue = value.toString();
        if (this.textCache.get(id) === strValue) return;
        this.getElement(id).textContent = strValue;
        this.textCache.set(id, strValue);
    }

    update() {
        if (!game) return;
        // should run no more than once per frame
        this.updateInfo();
        this.updateIce();
        this.updateWater();
        this.updateClouds();
        this.updateLand();
        this.updateTrees();
        this.updateFarms();
        this.updatePopulation();
        this.updateComputerRowProgress();
        this.updateComputer();
        this.updateRobots();
        this.updateRobotsRowProgress();
        this.updateEnergy();
        this.updateSpaceStation();
        this.updateTractorBeam();
        this.updateSpaceDock();
        this.updateHangar();
        this.progressBar1.tick(game.clouds.initialStormTimer - game.clouds.stormTimer, game.clouds.initialStormTimer);
        this.progressBar2.tick(game.clouds.stormDuration, game.clouds.initialStormDuration);
        updateSpace();
    }

    getElement(id: string): HTMLElement {
        const el = document.getElementById(id);
        if (!el) throw new Error(`Element ${id} not found`);
        return el;
    }

    updateInfo() {
        if (!game) return;
        this.updateElementText('totalWater', intToString(game.ice.ice + game.water.indoor + game.water.outdoor + game.clouds.water + game.land.water + game.trees.water + game.farms.water));
        this.updateElementText('cash', intToString(game.cash));
        this.updateElementText('oxygen', intToString(game.oxygen));
        this.updateElementText('science', intToString(game.science));
        this.updateElementText('wood', intToString(game.wood));
        this.updateElementText('metal', intToString(game.metal));
        this.updateElementText('oxygenLeak', intToString(game.oxygenLeak, 4));
    }

    updateIce() {
        if (!game) return;
        this.updateElementText('ice', intToString(game.ice.ice));
        this.updateElementText('buyableIce', intToString(game.ice.buyable));
        this.updateElementText('iceTransferred', intToString(game.ice.transferred, 4));
        this.updateElementText('indoorWaterReceived', intToString(game.ice.transferred, 4));
        this.updateElementText('iceBuyerAmount', game.ice.gain);
    }

    updateWater() {
        if (!game) return;
        this.updateElementText('indoorWater', intToString(game.water.indoor));
        this.updateElementText('indoorWaterMax', intToString(game.water.maxIndoor));
        this.updateElementText('indoorWaterSelling', intToString(game.water.selling));
        this.updateElementText('indoorWaterProfits', intToString(game.water.gain));
        this.updateElementText('excessWater', intToString(game.water.excess, 4));
        this.updateElementText('lakeWaterFromStorage', intToString(game.water.excess, 4));

        this.updateElementText('outdoorWater', intToString(game.water.outdoor));
        this.updateElementText('waterTransferred', intToString(game.water.transferred, 4));
        this.updateElementText('cloudsReceived', intToString(game.water.transferred, 4));
    }

    updateClouds() {
        if (!game) return;
        this.updateElementText('clouds', intToString(game.clouds.water));
        this.updateElementText('stormTimer', game.clouds.stormTimer);
        this.updateElementText('stormRate', game.clouds.stormRate + "%");
        this.getElement('intensityPB').style.height = game.clouds.stormRate + "%";
        this.updateElementText('stormDuration', game.clouds.stormDuration);
        this.updateElementText('rain', intToString(game.clouds.transferred, 4));
        this.updateElementText('landReceived', intToString(game.clouds.transferred, 4));
        this.updateElementText('lightningChance', intToString(game.clouds.lightningChance));
        this.updateElementText('lightningStrength', intToString(game.clouds.lightningStrength));
    }

    updateLand() {
        if (!game) return;
        this.updateElementText('landWater', intToString(game.land.water));
        this.updateElementText('optimizedLand', intToString(game.land.optimizedLand));
        this.updateElementText('baseLand', intToString(game.land.baseLand));
        this.updateElementText('land', intToString(game.land.land));
        this.updateElementText('soil', intToString(game.land.soil));
        this.updateElementText('landConverted', intToString(game.land.convertedLand, 4));
        this.updateElementText('landWaterToForest', intToString(game.land.transferred, 4));
        this.updateElementText('forestReceived', intToString(game.land.transferred, 4));
        this.updateElementText('landWaterToFarm', intToString(game.land.transferred, 4));
        this.updateElementText('farmReceived', intToString(game.land.transferred, 4));
    }

    updateTrees() {
        if (!game) return;
        this.updateElementText('forestWater', intToString(game.trees.water));
        this.updateElementText('ferns', intToString(game.trees.ferns));
        this.updateElementText('fernsDelta', intToString(game.trees.fernsDelta, 4));
        this.updateElementText('smallTrees', intToString(game.trees.smallTrees));
        this.updateElementText('smallTreesDelta', intToString(game.trees.smallTreesDelta, 4));
        this.updateElementText('trees', intToString(game.trees.trees));
        this.updateElementText('treesDelta', intToString(game.trees.treesDelta, 4));
        this.updateElementText('totalPlants', intToString(game.trees.totalPlants));
        this.updateElementText('oxygenGain', intToString(game.trees.oxygenGain, 4));
        this.updateElementText('forestWaterToLake', intToString(game.trees.transferred, 4));
        this.updateElementText('lakeWaterFromForest', intToString(game.trees.transferred, 4));
        this.updateElementText('fernWater', intToString(game.trees.fernsWaterUse, 4));
        this.updateElementText('smallTreesWater', intToString(game.trees.smallTreesWaterUse, 4));
        this.updateElementText('treesWater', intToString(game.trees.treesWaterUse, 4));
    }

    updateFarms() {
        if (!game) return;
        this.updateElementText('farmsWater', intToString(game.farms.water));
        this.updateElementText('farms', intToString(game.farms.farms));
        this.updateElementText('food', intToString(game.farms.food));
        this.updateElementText('foodCreated', intToString(game.farms.foodCreated, 4));
        this.updateElementText('farmFoodEaten', intToString(game.population.foodEaten, 4));
        this.updateElementText('efficiency', intToString(game.farms.efficiency * 100, 1));
        this.updateElementText('farmWaterToLake', intToString(game.farms.transferred, 4));
        this.updateElementText('lakeWaterFromFarm', intToString(game.farms.transferred, 4));
    }

    updatePopulation() {
        if (!game) return;
        this.updateElementText('population', intToString(game.population.people));
        this.updateElementText('foodEaten', intToString(game.population.foodEaten, 4));
        this.updateElementText('populationGrowth', intToStringNegative(game.population.popGrowth, 4));
        this.updateElementText('starving', intToString(game.population.starving, 4));
        this.updateElementText('scienceDelta', intToString(game.population.scienceDelta, 4));
        this.updateElementText('cashDelta', intToString(game.population.cashDelta, 4));
        this.updateElementText('scienceRatio', game.population.scienceRatio < 50 ? 100 - game.population.scienceRatio + "% science" : game.population.scienceRatio + "% cash");

        this.updateElementText('happiness', intToString(game.population.happiness, 4));
        this.updateElementText('happinessFromHouse', intToString(game.population.houseBonus));
        this.updateElementText('happinessFromTrees', intToString(game.population.happinessFromTrees, 4));
        this.updateElementText('happinessFromOxygen', intToString(game.population.happinessFromOxygen, 4));
    }

    checkComputerUnlocked() {
        if (!game) return;
        if (game.computer.unlocked) {
            this.getElement('unlockedComputer').style.display = "inline-block";
            this.getElement('unlockComputer').style.display = "none";
            this.getElement('robotsContainer').style.display = "inline-block";
        } else {
            this.getElement('unlockedComputer').style.display = "none";
            this.getElement('unlockComputer').style.display = "inline-block";
            this.getElement('robotsContainer').style.display = "none";
        }
    }

    checkRobotsUnlocked() {
        if (!game) return;
        if (game.robots.unlocked) {
            if (game.robots.failed) {
                this.getElement('unlockedRobots').style.display = "none";
                this.getElement('failRobots').style.display = "inline-block";
            } else {
                this.getElement('unlockedRobots').style.display = "inline-block";
                this.getElement('unlockRobots').style.display = "none";
                this.getElement('failRobots').style.display = "none";
                this.getElement('lightningContainer').style.display = "inline-block";
                this.getElement('lightningTooltip').style.display = "inline-block";
                this.getElement('energyContainer').style.display = "inline-block";
                this.getElement('woodContainer').style.display = "inline-block";
                this.getElement('metalContainer').style.display = "inline-block";
            }
        } else {
            this.getElement('unlockedRobots').style.display = "none";
            this.getElement('unlockRobots').style.display = "inline-block";
            this.getElement('lightningContainer').style.display = "none";
            this.getElement('lightningTooltip').style.display = "none";
            this.getElement('energyContainer').style.display = "none";
            this.getElement('woodContainer').style.display = "none";
            this.getElement('metalContainer').style.display = "none";
        }
    }

    updateComputerRowProgress() {
        if (!game || !game.computer.unlocked) {
            return;
        }
        for (let i = 0; i < game.computer.processes.length; i++) {
            const row = game.computer.processes[i];
            if (!row) continue;
            const baseId = "computerRow" + i;
            this.getElement(baseId + "PB").style.width = (row.currentTicks / row.ticksNeeded) * 100 + "%";
            this.getElement(baseId + "PB").style.backgroundColor = row.isMoving ? "yellow" : "red";
            this.updateElementText(baseId + "CurrentTicks", row.currentTicks);
            this.updateElementText(baseId + "TicksNeeded", row.ticksNeeded);
            if (row.cost !== 0) {
                this.getElement(baseId + "Cost").style.display = "block";
                this.updateElementText(baseId + "Cost", "Each tick costs " + intToString(row.cost) + " " + row.costType);
            } else {
                this.getElement(baseId + "Cost").style.display = "none";
            }
        }
        this.updateElementText('landOptimized', round2((game.land.optimizedLand / (game.land.baseLand * 10)) * 100) + "%");
    }

    updateComputer() {
        if (!game) return;
        this.updateElementText('freeThreads', game.computer.freeThreads);
        this.updateElementText('threads', game.computer.threads);
        this.updateElementText('speed', game.computer.speed);
        this.updateElementText('threadCost', intToString(game.computer.getThreadCost(), 1));
        this.updateElementText('speedCost', intToString(game.computer.getSpeedCost(), 1));
        for (let i = 0; i < game.computer.processes.length; i++) {
            const row = game.computer.processes[i];
            if (!row) continue;
            this.updateElementText('computerRow' + i + 'Threads', row.threads);
            this.getElement('computerRow' + i + 'Container').style.display = row.showing() ? "block" : "none";
        }
    }

    addComputerRow(dataPos: number) {
        const containerDiv = this.getElement('computerRows');
        const rowContainer = document.createElement("div");
        rowContainer.className = "computerRow";
        const baseId = "computerRow" + dataPos;
        rowContainer.id = baseId + 'Container';

        const plusButton = document.createElement("div");
        plusButton.id = baseId + "Plus";
        plusButton.className = "button";
        plusButton.innerHTML = "+";
        plusButton.addEventListener('click', (event) => game?.computer.addThread(dataPos, getClickAmount(event)));

        const minusButton = document.createElement("div");
        minusButton.id = baseId + "Minus";
        minusButton.className = "button";
        minusButton.innerHTML = "-";
        minusButton.addEventListener('click', (event) => game?.computer.removeThread(dataPos, getClickAmount(event)));

        const threads = document.createElement("div");
        threads.id = baseId + "Threads";
        threads.className = "small";
        threads.style.marginRight = "4px";

        const text = document.createElement("div");
        text.innerHTML = processesView[dataPos]?.text || "";

        const progressBar = document.createElement("div");
        progressBar.className = "rowProgressBarOuter";
        progressBar.innerHTML = "<div class='rowProgressBarInner' id='" + baseId + "PB'></div>";

        const tooltipContainer = document.createElement("div");
        tooltipContainer.className = "computerTooltipContainer";
        tooltipContainer.id = baseId + "Tooltip";

        const tooltipInner = document.createElement("div");
        tooltipInner.className = "rowTooltip";
        tooltipInner.innerHTML = "<div id='" + baseId + "CurrentTicks'></div> ticks<br>" +
            "<div id='" + baseId + "TicksNeeded'></div> ticks needed<br>" +
            "<div id='" + baseId + "Cost'></div><br>" + (processesView[dataPos]?.tooltip || "");

        tooltipContainer.appendChild(tooltipInner);

        rowContainer.onmouseover = function () {
            const el = document.getElementById(baseId + "Tooltip");
            if (el) el.style.display = "block";
        };
        rowContainer.onmouseout = function () {
            const el = document.getElementById(baseId + "Tooltip");
            if (el) el.style.display = "none";
        };

        rowContainer.appendChild(plusButton);
        rowContainer.appendChild(threads);
        rowContainer.appendChild(minusButton);
        rowContainer.appendChild(text);
        rowContainer.appendChild(progressBar);
        rowContainer.appendChild(tooltipContainer);

        containerDiv.appendChild(rowContainer);
    }

    updateRobots() {
        if (!game) return;
        this.updateElementText('robots', game.robots.robots);
        this.updateElementText('robotsFree', game.robots.robotsFree);
        this.updateElementText('robotMax', game.robots.robotMax);
        for (let i = 0; i < game.robots.jobs.length; i++) {
            const row = game.robots.jobs[i];
            if (!row) continue;
            this.updateElementText('robotRow' + i + 'Workers', row.workers);
            this.getElement('robotRow' + i + 'Container').style.display = row.showing() ? "block" : "none";
        }
    }

    updateRobotsRowProgress() {
        if (!game) return;
        this.updateElementText('ore', intToString(game.robots.ore));
        for (let i = 0; i < game.robots.jobs.length; i++) {
            const row = game.robots.jobs[i];
            if (!row) continue;
            const baseId = "robotRow" + i;
            if (row.ticksNeeded === undefined) { // Has a progress bar
                continue;
            }
            this.getElement(baseId + "PB").style.width = ((row.currentTicks || 0) / row.ticksNeeded) * 100 + "%";
            this.getElement(baseId + "PB").style.backgroundColor = row.isMoving ? "yellow" : "red";
            this.updateElementText(baseId + "CurrentTicks", (row.currentTicks || 0));
            this.updateElementText(baseId + "TicksNeeded", intToString(row.ticksNeeded, 1));
            if (row.cost && row.costType) {
                this.getElement(baseId + "Cost").style.display = "block";
                let costString = "Each tick costs " + intToString(row.cost[0] || 0) + " " + (row.costType[0] || "");
                costString += row.cost.length > 1 ? " and " + intToString(row.cost[1] || 0) + " " + (row.costType[1] || "") : "";
                this.updateElementText(baseId + "Cost", costString);
            } else {
                this.getElement(baseId + "Cost").style.display = "none";
            }
        }
        if (game.robots.jobs[5]) {
            this.updateElementText('totalDirtFromOre', intToString((game.robots.jobs[5].completions || 0) * 5));
        }
    }

    addRobotRow(dataPos: number) {
        const containerDiv = this.getElement('robotRows');
        const rowContainer = document.createElement("div");
        rowContainer.className = "robotRow";
        const baseId = "robotRow" + dataPos;
        rowContainer.id = baseId + 'Container';

        const plusButton = document.createElement("div");
        plusButton.id = baseId + "Plus";
        plusButton.className = "button";
        plusButton.innerHTML = "+";
        plusButton.addEventListener('click', (event) => game?.robots.addWorker(dataPos, getClickAmount(event)));

        const minusButton = document.createElement("div");
        minusButton.id = baseId + "Minus";
        minusButton.className = "button";
        minusButton.innerHTML = "-";
        minusButton.addEventListener('click', (event) => game?.robots.removeWorker(dataPos, getClickAmount(event)));

        const workers = document.createElement("div");
        workers.id = baseId + "Workers";
        workers.className = "small";
        workers.style.marginRight = "4px";

        const text = document.createElement("div");
        text.innerHTML = jobsView[dataPos]?.text || "";

        const progressBar = document.createElement("div");
        if (game?.robots.jobs[dataPos]?.ticksNeeded) {
            progressBar.className = "rowProgressBarOuter";
            progressBar.innerHTML = "<div class='rowProgressBarInner' id='" + baseId + "PB'></div>";
        }

        const tooltipContainer = document.createElement("div");
        tooltipContainer.className = "computerTooltipContainer";
        tooltipContainer.id = baseId + "Tooltip";

        const tooltipInner = document.createElement("div");
        tooltipInner.className = "rowTooltip";

        let tooltipContent = "";
        if (game?.robots.jobs[dataPos]?.ticksNeeded) {
            tooltipContent = "<div id='" + baseId + "CurrentTicks'></div> ticks<br>" +
                "<div id='" + baseId + "TicksNeeded'></div> ticks needed<br>" +
                "<div id='" + baseId + "Cost'></div><br>";
        }
        tooltipInner.innerHTML = tooltipContent + (jobsView[dataPos]?.tooltip || "");
        tooltipContainer.appendChild(tooltipInner);

        rowContainer.onmouseover = function () {
            const el = document.getElementById(baseId + "Tooltip");
            if (el) el.style.display = "block";
        };
        rowContainer.onmouseout = function () {
            const el = document.getElementById(baseId + "Tooltip");
            if (el) el.style.display = "none";
        };

        rowContainer.appendChild(plusButton);
        rowContainer.appendChild(workers);
        rowContainer.appendChild(minusButton);
        rowContainer.appendChild(text);
        if (progressBar.innerHTML) rowContainer.appendChild(progressBar);
        rowContainer.appendChild(tooltipContainer);

        containerDiv.appendChild(rowContainer);
    }

    checkEnergyUnlocked() {
        if (!game) return;
        if (game.energy.unlocked) {
            this.getElement('unlockedEnergy').style.display = "inline-block";
            this.getElement('unlockEnergy').style.display = "none";
            if (this.getElement('spaceDockContainer').classList.contains("disabled")) {
                this.getElement('spaceDockContainer').classList.remove("disabled");
            }
            this.updateRobots();
        } else {
            this.getElement('unlockedEnergy').style.display = "none";
            this.getElement('unlockEnergy').style.display = "inline-block";
            if (!this.getElement('spaceDockContainer').classList.contains("disabled")) {
                this.getElement('spaceDockContainer').classList.add("disabled");
            }
        }
    }

    updateEnergy() {
        if (!game) return;
        this.updateElementText('energy', intToString(game.power));
        this.updateElementText('battery', intToString(game.energy.battery, 1));
        this.updateElementText('drain', intToString(game.energy.drain));
    }

    checkSpaceStationUnlocked() {
        if (!game) return;
        if (game.energy.unlocked) {
            this.getElement('spaceStationContainer').style.display = "inline-block";
        } else {
            this.getElement('spaceStationContainer').style.display = "none";
        }

        if (game.spaceStation.unlocked) {
            this.getElement('unlockedSpaceStation').style.display = "inline-block";
            this.getElement('unlockSpaceStation').style.display = "none";
        } else {
            this.getElement('unlockedSpaceStation').style.display = "none";
            this.getElement('unlockSpaceStation').style.display = "inline-block";
        }
    }

    updateSpaceStation() {
        if (!game) return;
        let orbitString = "";
        let orbitSendString = "";
        for (let i = 0; i < game.spaceStation.orbiting.length; i++) {
            const resource = game.spaceStation.orbiting[i];
            if (!resource) continue;
            orbitString += intToString(resource.amount) + " " + resource.type;
            orbitSendString += intToString(resource.amount / 10000, 4) + " " + resource.type;
            if (i !== game.spaceStation.orbiting.length - 1) {
                orbitString += ", ";
                orbitSendString += ", ";
            }
        }
        this.updateElementText('orbitingResources', orbitString);
        this.updateElementText('orbitSending', orbitSendString);
    }

    checkTractorBeamUnlocked() {
        if (!game) return;
        if (game.spaceStation.unlocked) {
            this.getElement('tractorBeamContainer').style.display = "inline-block";
        } else {
            this.getElement('tractorBeamContainer').style.display = "none";
        }

        if (game.tractorBeam.unlocked) {
            this.getElement('unlockedTractorBeam').style.display = "inline-block";
            this.getElement('unlockTractorBeam').style.display = "none";
        } else {
            this.getElement('unlockedTractorBeam').style.display = "none";
            this.getElement('unlockTractorBeam').style.display = "inline-block";
        }
    }


    updateTractorBeam() {
        if (!game) return;
        const container = this.getElement("allPassing");
        let text = "";
        const comets = game.tractorBeam.comets;
        for (let i = 0; i < comets.length; i++) {
            const comet = comets[i];
            if (!comet) continue;
            text += comet.name + " with " +
                intToString(comet.amount, 1) +
                " " + comet.amountType +
                " passing in " + comet.duration + "<br>";
            this.drawComet(comet);
        }
        if (this.textCache.get("allPassing") !== text) {
            container.innerHTML = text;
            this.textCache.set("allPassing", text);
        }
        this.updateElementText('takeAmount', game.tractorBeam.takeAmount);
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
            cometDiv.style.left = cometData.left + "px";
            cometDiv.style.top = cometData.top + "px";
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

    updateSpaceDock() {
        if (!game) return;
        this.updateElementText('battleships', game.spaceDock.battleships);
    }

    checkSpaceDockUnlocked() {
        if (!game) return;
        if (game.spaceDock.unlocked) {
            this.getElement('spaceDockContainer').style.display = "inline-block";
            this.getElement('hangarContainer').style.display = "inline-block";
            this.getElement('spaceCanvas').style.display = "inline-block";
            this.getElement('spaceContainer').style.display = "inline-block";
        } else {
            this.getElement('spaceDockContainer').style.display = "none";
            this.getElement('hangarContainer').style.display = "none";
            this.getElement('spaceCanvas').style.display = "none";
            this.getElement('spaceContainer').style.display = "none";
        }
    }

    updateHangar() {
        if (!game) return;
        this.updateElementText("hangarSending", game.hangar.sendRate + " in " + round1(game.hangar.timeRemaining / 10) + " seconds.");
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