import { game } from '../main';
import { intToString, round1 } from '../utils/utils';
import BaseView from './BaseView';
import UIEvents from './UIEvents';

export default class HangarView extends BaseView {

    constructor() {
        super();
        if (game) {
            UIEvents.on(game.events, 'hangar:updated', () => this.updateFull());

            const maxMinesEl = document.getElementById('maxMinesInput');
            if (maxMinesEl) {
                maxMinesEl.addEventListener('change', (e) => {
                    if (game) game.hangar.maxMines = Number((e.target as HTMLInputElement).value);
                });
            }
        }
    }

    override update() {
        if (!game) return;
        this.updateElementText("hangarSending", game.hangar.sendRate + " in " + round1(game.hangar.timeRemaining / 10) + " seconds.");
    }

    override updateFull() {
        if (!game) return;
        if (this.getElement('hangarContainer').classList.contains('hidden')) return;
        const el = document.getElementById('buyHangarAmount') as HTMLInputElement;
        const amount = el ? Number(el.value) : 1;
        this.updateElementText('hangarCost', intToString(amount * 1000000));

        const maxMinesEl = document.getElementById('maxMinesInput') as HTMLInputElement;
        if (maxMinesEl) {
            maxMinesEl.value = game.hangar.maxMines.toString();
        }

        this.update();
    }
}
