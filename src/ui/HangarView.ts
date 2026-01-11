import { game } from '../main';
import { intToString, round1 } from '../utils/utils';
import BaseView from './BaseView';
import UIEvents from './UIEvents';
import Hangar from '../core/Hangar';

export default class HangarView extends BaseView {

    constructor() {
        super();
        if (game) {
            UIEvents.on(game.events, 'hangar:updated', () => UIEvents.notifyOnlyOnce(() => this.updateFull(), this));

            const maxMinesEl = document.getElementById('maxMinesInput');
            if (maxMinesEl) {
                maxMinesEl.addEventListener('change', (e) => {
                    if (game) game.hangar.maxMines = Number((e.target as HTMLInputElement).value);
                });
            }

            this.setupAmountCostListener('buyHangarAmount', [
                { spanId: 'hangarCost', costPerUnit: Hangar.METAL_COST_PER_RATE }
            ]);
        }
    }

    override update() {
        if (!game) return;
        this.updateElementText("hangarSending", game.hangar.sendRate + " in " + round1(game.hangar.timeRemaining / 10) + " seconds.");
    }

    override updateFull() {
        if (!game) return;
        if (this.getElement('hangarContainer').classList.contains('hidden')) return;
        const amount = this.getAmount('buyHangarAmount');
        this.updateCostSpans(amount, [
            { spanId: 'hangarCost', costPerUnit: Hangar.METAL_COST_PER_RATE }
        ]);

        const maxMinesEl = document.getElementById('maxMinesInput') as HTMLInputElement;
        if (maxMinesEl) {
            maxMinesEl.value = game.hangar.maxMines.toString();
        }

        this.update();
    }
}
