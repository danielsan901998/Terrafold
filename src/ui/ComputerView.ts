import { game } from '../main';
import { intToString, round2, getClickAmount } from '../utils/utils';
import BaseView from './BaseView';
import UIEvents from './UIEvents';

export default class ComputerView extends BaseView {
    private rows: Map<number, HTMLElement> = new Map();

    constructor() {
        super();
        if (game) {
            UIEvents.on(game.events, 'computer:unlocked', () => this.checkUnlocked());
            UIEvents.on(game.events, 'computer:threads:updated', () => this.updateThreads());
            UIEvents.on(game.events, 'computer:speed:updated', () => this.updateSpeed());
            UIEvents.on(game.events, 'computer:optimize-land:updated', () => this.updateLandOptimized());
            UIEvents.on(game.events, 'robots:unlocked', () => this.updateVisibility());
            UIEvents.on(game.events, 'spaceDock:unlocked', () => this.updateVisibility());
            UIEvents.on(game.events, 'computer:visibility:updated', () => this.updateVisibility());
        }
    }

    checkUnlocked() {
        if (!game) return;
        if (game.computer.unlocked) {
            this.setVisible('unlockedComputer', true);
            this.setVisible('unlockComputer', false);
            this.setVisible('robotsContainer', true);
            this.updateThreads();
            this.updateSpeed();
            this.updateVisibility();
        } else {
            this.setVisible('unlockedComputer', false);
            this.setVisible('unlockComputer', true);
            this.setVisible('robotsContainer', false);
        }
    }

    updateVisibility() {
        if (!game) return;
        for (let i = 0; i < game.computer.processes.length; i++) {
            const row = game.computer.processes[i];
            if (!row) continue;
            this.setVisible('computerRow' + i + 'Container', row.showing);
        }
    }

    updateLandOptimized() {
        if (!game) return;
        this.updateElementText('landOptimized', round2((game.land.optimizedLand / (game.land.baseLand * 10)) * 100) + "%");
    }

    updateThreads() {
        if (!game) return;
        this.updateElementText('freeThreads', intToString(game.computer.freeThreads));
        this.updateElementText('threads', intToString(game.computer.threads));
        this.updateElementText('threadCost', intToString(game.computer.getThreadCost()));
        for (let i = 0; i < game.computer.processes.length; i++) {
            const row = game.computer.processes[i];
            if (!row) continue;
            
            const elementId = 'computerRow' + i + 'Threads';
            if (row.showing && this.elementExists(elementId)) {
                this.updateElementText(elementId, intToString(row.workers));
            }
        }
    }

    updateSpeed() {
        if (!game) return;
        this.updateElementText('speed', intToString(game.computer.speed));
        this.updateElementText('speedCost', intToString(game.computer.getSpeedCost()));
    }

    updateRowProgress(i: number) {
        if (!game || !game.computer.unlocked) {
            return;
        }
        const row = game.computer.processes[i];
        if (!row || !row.showing) return;

        const baseId = "computerRow" + i;
        if (!this.elementExists(baseId + "PB")) return;

        const pb = this.getElement(baseId + "PB");
        pb.style.width = (row.currentTicks / row.ticksNeeded) * 100 + "%";
        pb.style.backgroundColor = row.isMoving ? "yellow" : "red";

        this.updateElementText(baseId + "CurrentTicks", intToString(row.currentTicks));
        this.updateElementText(baseId + "TicksNeeded", intToString(row.ticksNeeded));
        const costContainer = this.getElement(baseId + "CostContainer");
        if (row.cost !== 0) {
            costContainer.classList.remove("hidden");
            const cost = Array.isArray(row.cost) ? row.cost[0] || 0 : row.cost;
            const costType = Array.isArray(row.costType) ? row.costType[0] || "" : row.costType;
            this.updateElementText(baseId + "Cost", intToString(cost));
            this.updateElementText(baseId + "CostType", costType);
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

        const plusButton = document.createElement("button");
        plusButton.id = baseId + "Plus";
        plusButton.innerHTML = "+";
        plusButton.addEventListener('click', (event) => game?.computer.addThread(dataPos, getClickAmount(event)));

        const minusButton = document.createElement("button");
        minusButton.id = baseId + "Minus";
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

    override update() {
        // Progress updates are handled by View.updateComputerRowProgress()
    }

    public override updateFull() {
        if (!game) return;
        this.checkUnlocked();
        if (game.computer.unlocked) {
            this.updateLandOptimized();
            this.updateVisibility();
            this.updateThreads();
            this.updateSpeed();
        }
    }
}
