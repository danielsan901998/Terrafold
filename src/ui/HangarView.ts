import { game } from '../main';
import { round1, intToString } from '../utils/utils';
import BaseView from './BaseView';

export default class HangarView extends BaseView {


    constructor() {
        super();
        if (game) {
            game.events.on('hangar:updated', () => this.updateFull());
            const el = document.getElementById('buyHangarAmount');
            if (el) el.addEventListener('change', () => this.updateFull());
            const maxMinesEl = document.getElementById('maxMinesInput') as HTMLInputElement;
            if (maxMinesEl) {
                maxMinesEl.addEventListener('change', () => {
                    if (game) {
                        game.hangar.maxMines = Math.max(1, Math.floor(Number(maxMinesEl.value)));
                    }
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
