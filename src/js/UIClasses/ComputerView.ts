import { game } from '../../main';
import { intToString, getClickAmount, round2 } from '../utils';
import BaseView from './BaseView';

export default class ComputerView extends BaseView {

    constructor() {
        super();
        if (game) {
            game.events.on('computer:unlocked', () => this.checkUnlocked());
            game.events.on('computer:updated', () => this.update());
            game.events.on('computer:rowUpdated', (index: number) => this.updateRowProgress(index));
        }
    }

    checkUnlocked() {
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

    update() {
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

    updateRowProgress(i: number) {
        if (!game || !game.computer.unlocked) {
            return;
        }
        const row = game.computer.processes[i];
        if (!row) return;
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
        this.updateElementText('landOptimized', round2((game.land.optimizedLand / (game.land.baseLand * 10)) * 100) + "%");
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
        text.innerHTML = game?.computer.processes[dataPos]?.text || "";

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
            "<div id='" + baseId + "Cost'></div><br>" + (game?.computer.processes[dataPos]?.tooltip || "");

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
}
