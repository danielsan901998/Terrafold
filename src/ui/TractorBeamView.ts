import { game, view } from '../main';
import { intToString } from '../utils/utils';
import BaseView from './BaseView';

export default class TractorBeamView extends BaseView {
    private cometRows: Map<number, HTMLElement> = new Map();

    constructor() {
        super();
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

            this.updateElementText(`comet-amount-${comet.id}`, intToString(comet.amount, 1));
            this.updateElementText(`comet-duration-${comet.id}`, String(comet.duration));

            view.drawComet(comet);
        }

        this.updateElementText('takeAmount', String(game.tractorBeam.takeAmount));
    }
}
