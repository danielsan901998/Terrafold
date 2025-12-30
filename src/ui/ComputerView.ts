import { game } from '../main';
import { intToString, getClickAmount, round2 } from '../utils/utils';
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
            this.getElement('unlockedComputer').style.display = "block";
            this.getElement('unlockComputer').style.display = "none";
            this.getElement('robotsContainer').style.display = "flex";
        } else {
            this.getElement('unlockedComputer').style.display = "none";
            this.getElement('unlockComputer').style.display = "inline-block";
            this.getElement('robotsContainer').style.display = "none";
        }
    }

    update() {
        if (!game) return;
        this.updateElementText('freeThreads', String(game.computer.freeThreads));
        this.updateElementText('threads', String(game.computer.threads));
        this.updateElementText('speed', String(game.computer.speed));
        this.updateElementText('threadCost', intToString(game.computer.getThreadCost(), 1));
        this.updateElementText('speedCost', intToString(game.computer.getSpeedCost(), 1));
        this.updateElementText('landOptimized', round2((game.land.optimizedLand / (game.land.baseLand * 10)) * 100) + "%");
        for (let i = 0; i < game.computer.processes.length; i++) {
            const row = game.computer.processes[i];
            if (!row) continue;
            this.updateElementText('computerRow' + i + 'Threads', String(row.threads));
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
        this.updateElementText(baseId + "CurrentTicks", String(row.currentTicks));
        this.updateElementText(baseId + "TicksNeeded", String(row.ticksNeeded));
        const costContainer = this.getElement(baseId + "CostContainer");
        if (row.cost !== 0) {
            costContainer.classList.remove("hidden");
            this.updateElementText(baseId + "Cost", intToString(row.cost));
            this.updateElementText(baseId + "CostType", row.costType);
        } else {
            costContainer.classList.add("hidden");
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

        const processName = game?.computer.processes[dataPos]?.text || "";
        const text = document.createElement("div");
        text.innerHTML = processName;

        const progressBar = document.createElement("div");
        progressBar.className = "rowProgressBarOuter";
        progressBar.innerHTML = "<div class='rowProgressBarInner' id='" + baseId + "PB'></div>";

        const tooltipContainer = document.createElement("div");
        tooltipContainer.className = "computerTooltipContainer";
        tooltipContainer.id = baseId + "Tooltip";

        const tooltipInner = document.createElement("div");
        tooltipInner.className = "rowTooltip";
        
        const description = game?.computer.processes[dataPos]?.tooltip || "";
        
        tooltipInner.innerHTML = `
            <div class="tooltipDescription">${description}</div>
            <div class="tooltipDivider"></div>
            <div class="tooltipStats">
                <div><b>Progress:</b> <span id="${baseId}CurrentTicks"></span> / <span id="${baseId}TicksNeeded"></span> ticks</div>
                <div id="${baseId}CostContainer" class="hidden"><b>Cost:</b> <span id="${baseId}Cost"></span> <span id="${baseId}CostType"></span> per tick</div>
            </div>
        `;

        tooltipContainer.appendChild(tooltipInner);

        rowContainer.appendChild(plusButton);
        rowContainer.appendChild(threads);
        rowContainer.appendChild(minusButton);
        
        const label = document.createElement("div");
        label.className = "rowLabel";
        label.appendChild(text);
        rowContainer.appendChild(label);
        
        rowContainer.appendChild(progressBar);
        rowContainer.appendChild(tooltipContainer);

        containerDiv.appendChild(rowContainer);
    }
}
