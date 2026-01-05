import { game, view } from '../main';
import { intToString } from '../utils/utils';
import { OrbitingResource } from '../types';
import BaseView from './BaseView';

export default class TractorBeamView extends BaseView {
    private cometRows: Map<number, HTMLElement> = new Map();
    private takeAmountRows: Map<string, HTMLElement> = new Map();

    constructor() {
        super();
        const allPassing = document.getElementById('allPassing');
        if (allPassing) allPassing.innerHTML = '';
        const takeAmountContainer = document.getElementById('takeAmountContainer');
        if (takeAmountContainer) takeAmountContainer.innerHTML = '';
        
        if (game) {
            game.events.on('tractorBeam:unlocked', () => this.checkUnlocked());
            game.events.on('tractorBeam:updated', () => this.update());
            game.events.on('tractorBeam:removeComet', (comet: any) => {
                if (view) view.removeComet(comet);
            });
        }
    }

    checkUnlocked() {
        if (!game) return;
        if (game.tractorBeam.unlocked) {
            this.setVisible('unlockedTractorBeam', true);
            this.setVisible('unlockTractorBeam', false);
        } else {
            this.setVisible('unlockedTractorBeam', false);
            this.setVisible('unlockTractorBeam', true);
        }
    }

    update() {
        if (!game || !view) return;
        const container = this.getElement("allPassing");
        const comets = game.tractorBeam.comets;

        // Remove old comets that are no longer present
        const cometIds = new Set(comets.map(c => c.id));
        for (const [id, row] of this.cometRows.entries()) {
            if (!cometIds.has(id)) {
                row.remove();
                this.cometRows.delete(id);
            }
        }

        for (let i = 0; i < comets.length; i++) {
            const comet = comets[i];
            if (!comet) continue;

            if (!this.cometRows.has(comet.id)) {
                const row = document.createElement("div");
                row.className = "comet-row";
                row.innerHTML = `<span>${comet.name}</span> with <span id="comet-amount-${comet.id}"></span> ${comet.amountType} passing in <span id="comet-duration-${comet.id}"></span>`;

                container.appendChild(row);
                this.cometRows.set(comet.id, row);
            }

            this.updateElementText(`comet-amount-${comet.id}`, intToString(comet.amount));
            this.updateElementText(`comet-duration-${comet.id}`, intToString(comet.duration));

            view.drawComet(comet);
        }

        this.updateTakeAmount();
    }

    updateTakeAmount() {
        if (!game) return;
        const container = this.getElement("takeAmountContainer");
        const resources: OrbitingResource[] = game.tractorBeam.takeAmount;
        const visibleResources = resources.filter((r) => r.amount > 0);

        // Check if the set of visible resources changed to determine if we need to rebuild the structure
        const visibleTypesKey = visibleResources.map((r) => r.type).join(',');
        const currentTypesKey = Array.from(this.takeAmountRows.keys()).join(',');

        if (visibleTypesKey !== currentTypesKey) {
            container.innerHTML = '';
            this.takeAmountRows.clear();

            for (let i = 0; i < visibleResources.length; i++) {
                const resource = visibleResources[i]!;
                const row = document.createElement("span");
                const isLast = i === visibleResources.length - 1;
                
                // Create structure once: value span + label + optional comma
                row.innerHTML = `<span id="takeAmountVal-${resource.type}"></span> ${resource.type}${isLast ? "" : ", "}`;
                container.appendChild(row);
                this.takeAmountRows.set(resource.type, row);
            }
        }

        // Update only the numerical values
        for (const resource of visibleResources) {
            this.updateElementText(`takeAmountVal-${resource.type}`, intToString(resource.amount, 3));
        }
    }
}
