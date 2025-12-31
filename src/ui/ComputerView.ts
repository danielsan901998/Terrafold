import { game } from '../main';
import { intToString, getClickAmount, round2 } from '../utils/utils';
import BaseView from './BaseView';

export default class ComputerView extends BaseView {
    private hoveredIndex: number | null = null;

    constructor() {
        super();
        if (game) {
            game.events.on('computer:unlocked', () => this.checkUnlocked());
            game.events.on('computer:updated', () => this.update());
        }
    }

    checkUnlocked() {
        if (!game) return;
        if (game.computer.unlocked) {
            this.setVisible('unlockedComputer', true);
            this.setVisible('unlockComputer', false);
            this.setVisible('robotsContainer', true);
            this.update();
        } else {
            this.setVisible('unlockedComputer', false);
            this.setVisible('unlockComputer', true);
            this.setVisible('robotsContainer', false);
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
            this.setVisible('computerRow' + i + 'Container', row.showing());
        }
    }

    updateRowProgress(i: number) {
        if (!game || !game.computer.unlocked) {
            return;
        }
        const row = game.computer.processes[i];
        if (!row || !row.showing()) return;

        const baseId = "computerRow" + i;
        const pb = this.getElement(baseId + "PB");
        pb.style.width = (row.currentTicks / row.ticksNeeded) * 100 + "%";
        pb.style.backgroundColor = row.isMoving ? "yellow" : "red";

        // Only update tooltip text if it's actually visible (hovered)
        if (this.hoveredIndex === i) {
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
    }

    addComputerRow(dataPos: number) {
        const containerDiv = this.getElement('computerRows');
        const rowContainer = document.createElement("div");
        rowContainer.className = "computerRow";
        const baseId = "computerRow" + dataPos;
        rowContainer.id = baseId + 'Container';

        rowContainer.addEventListener('mouseenter', () => {
            this.hoveredIndex = dataPos;
            this.updateRowProgress(dataPos);
        });
        rowContainer.addEventListener('mouseleave', () => this.hoveredIndex = null);

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
