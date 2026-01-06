import { game } from '../main';
import { intToString, getClickAmount } from '../utils/utils';
import BaseView from './BaseView';

export default class RobotsView extends BaseView {

    constructor() {
        super();
        if (game) {
            game.events.on('robots:unlocked', () => {
                this.checkUnlocked();
                this.updateCount();
                this.updateStorage();
                this.updateVisibility();
            });
            game.events.on('robots:count:updated', () => this.updateCount());
            game.events.on('robots:storage:updated', () => this.updateStorage());
            game.events.on('robots:mines:updated', () => this.updateMinesCount());
            game.events.on('energy:unlocked', () => {
                this.updateCount();
                this.updateVisibility();
            });
        }
    }

    checkUnlocked() {
        if (!game) return;
        if (game.robots.unlocked) {
            this.setVisible('unlockedRobots', true);
            this.setVisible('unlockRobots', false);
            this.setVisible('lightningContainer', true);
            this.setVisible('lightningTooltip', true);
            this.setVisible('energyContainer', true);
            this.setVisible('woodContainer', true);
            this.setVisible('oreContainer', true);
            this.setVisible('metalContainer', true);
            this.updateCount();
            this.updateStorage();
            this.updateMinesCount();
            this.updateVisibility();
        } else {
            this.setVisible('unlockedRobots', false);
            this.setVisible('unlockRobots', true);
            this.setVisible('lightningContainer', false);
            this.setVisible('lightningTooltip', false);
            this.setVisible('energyContainer', false);
            this.setVisible('woodContainer', false);
            this.setVisible('oreContainer', false);
            this.setVisible('metalContainer', false);
        }
    }

    updateVisibility() {
        if (!game) return;
        for (let i = 0; i < game.robots.jobs.length; i++) {
            const row = game.robots.jobs[i];
            if (!row) continue;
            this.setVisible('robotRow' + i + 'Container', row.showing);
        }
    }

    updateCount() {
        if (!game) return;
        this.updateElementText('robots', intToString(game.robots.robots));
        this.updateElementText('robotsFree', intToString(game.robots.robotsFree));
        
        const buildMines = game.robots.jobs[2];
        if (buildMines) {
            const landUnits = game.land.optimizedLand / 1000;
            const limit = Math.floor(Math.pow(landUnits, 2) / 10);
            this.updateElementText("minesLimit", intToString(limit));
        }

        if (game.robots.jobs[5]) {
            this.updateElementText('totalDirtFromOre', intToString(game.robots.jobs[5].completions * 5));
        }

        for (let i = 0; i < game.robots.jobs.length; i++) {
            const row = game.robots.jobs[i];
            if (!row) continue;
            
            if (row.showing) {
                const baseId = 'robotRow' + i;
                this.updateElementText(baseId + 'Workers', intToString(row.workers));
            }
        }
    }

    updateMinesCount() {
        if (!game) return;
        this.updateElementText("minesCount", intToString(game.robots.mines));
    }

    updateStorage() {
        if (!game) return;
        this.updateElementText('robotMax', intToString(game.robots.robotMax));
    }

    updateRowProgress(i: number) {
        if (!game) return;
        const row = game.robots.jobs[i];
        if (!row || !row.showing || row.ticksNeeded === 0) {
            return;
        }
        
        const baseId = "robotRow" + i;
        const pb = this.getElement(baseId + "PB");
        pb.style.width = (row.currentTicks / row.ticksNeeded) * 100 + "%";
        pb.style.backgroundColor = row.isMoving ? "yellow" : "red";

        this.updateElementText(baseId + "CurrentTicks", intToString(row.currentTicks));
        this.updateElementText(baseId + "TicksNeeded", intToString(row.ticksNeeded));
        const costContainer = this.getElement(baseId + "CostContainer");
        if (row.cost && row.costType) {
            costContainer.classList.remove("hidden");
            const costs = Array.isArray(row.cost) ? row.cost : [row.cost];
            const costTypes = Array.isArray(row.costType) ? row.costType : [row.costType];
            let costString = intToString(costs[0] || 0) + " " + (costTypes[0] || "");
            costString += costs.length > 1 ? " and " + intToString(costs[1] || 0) + " " + (costTypes[1] || "") : "";
            this.updateElementText(baseId + "Cost", costString);
        } else {
            costContainer.classList.add("hidden");
        }
    }

    addRobotRow(dataPos: number) {
        const containerDiv = this.getElement('robotRows');
        const rowContainer = document.createElement("div");
        rowContainer.className = "robotRow";
        const baseId = "robotRow" + dataPos;
        rowContainer.id = baseId + 'Container';

        const plusButton = document.createElement("button");
        plusButton.id = baseId + "Plus";
        plusButton.innerHTML = "+";
        plusButton.addEventListener('click', (event) => game?.robots.addWorker(dataPos, getClickAmount(event)));

        const minusButton = document.createElement("button");
        minusButton.id = baseId + "Minus";
        minusButton.innerHTML = "-";
        minusButton.addEventListener('click', (event) => game?.robots.removeWorker(dataPos, getClickAmount(event)));

        const workers = document.createElement("div");
        workers.id = baseId + "Workers";
        workers.className = "small";
        workers.style.marginRight = "4px";

        const jobName = game?.robots.jobs[dataPos]?.text || "";
        const text = document.createElement("div");
        text.id = baseId + "Text";
        text.innerHTML = jobName;

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

        const description = game?.robots.jobs[dataPos]?.tooltip || "";
        
        let statsHtml = "";
        if (game?.robots.jobs[dataPos]?.ticksNeeded) {
            statsHtml = `
                <div class="tooltipDivider"></div>
                <div class="tooltipStats">
                    <div><b>Progress:</b> <span id="${baseId}CurrentTicks"></span> / <span id="${baseId}TicksNeeded"></span> ticks</div>
                    <div id="${baseId}CostContainer" class="hidden"><b>Cost:</b> <span id="${baseId}Cost"></span> per tick</div>
                </div>
            `;
        }

        tooltipInner.innerHTML = `
            <div class="tooltipDescription" id="${baseId}Description">${description}</div>
            ${statsHtml}
        `;
        
        tooltipContainer.appendChild(tooltipInner);

        rowContainer.appendChild(plusButton);
        rowContainer.appendChild(workers);
        rowContainer.appendChild(minusButton);
        
        const label = document.createElement("div");
        label.className = "rowLabel";
        label.appendChild(text);
        rowContainer.appendChild(label);
        
        if (progressBar.innerHTML) rowContainer.appendChild(progressBar);
        rowContainer.appendChild(tooltipContainer);

        containerDiv.appendChild(rowContainer);
    }
}
