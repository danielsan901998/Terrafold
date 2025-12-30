import { game } from '../main';
import { intToString, getClickAmount } from '../utils/utils';
import BaseView from './BaseView';

export default class RobotsView extends BaseView {

    constructor() {
        super();
        if (game) {
            game.events.on('robots:unlocked', () => this.checkUnlocked());
            game.events.on('robots:updated', () => this.update());
            game.events.on('robots:rowUpdated', (index: number) => this.updateRowProgress(index));
        }
    }

    checkUnlocked() {
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

    update() {
        if (!game) return;
        this.updateElementText('robots', String(game.robots.robots));
        this.updateElementText('robotsFree', String(game.robots.robotsFree));
        this.updateElementText('robotMax', String(game.robots.robotMax));
        this.updateElementText('ore', intToString(game.robots.ore));
        if (game.robots.jobs[5]) {
            this.updateElementText('totalDirtFromOre', intToString((game.robots.jobs[5].completions || 0) * 5));
        }
        for (let i = 0; i < game.robots.jobs.length; i++) {
            const row = game.robots.jobs[i];
            if (!row) continue;
            this.updateElementText('robotRow' + i + 'Workers', String(row.workers));
            this.getElement('robotRow' + i + 'Container').style.display = row.showing() ? "block" : "none";
        }
    }

    updateRowProgress(i: number) {
        if (!game) return;
        const row = game.robots.jobs[i];
        if (!row) return;
        const baseId = "robotRow" + i;
        if (row.ticksNeeded === undefined) { // Has a progress bar
            return;
        }
        this.getElement(baseId + "PB").style.width = ((row.currentTicks || 0) / row.ticksNeeded) * 100 + "%";
        this.getElement(baseId + "PB").style.backgroundColor = row.isMoving ? "yellow" : "red";
        this.updateElementText(baseId + "CurrentTicks", String(row.currentTicks || 0));
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
        text.innerHTML = game?.robots.jobs[dataPos]?.text || "";

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
        tooltipInner.innerHTML = tooltipContent + (game?.robots.jobs[dataPos]?.tooltip || "");
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
}
