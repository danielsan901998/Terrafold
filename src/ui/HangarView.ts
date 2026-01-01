import { game } from '../main';
import { round1, intToString } from '../utils/utils';
import BaseView from './BaseView';

export default class HangarView extends BaseView {


    constructor() {
        super();
        if (game) {
            game.events.on('hangar:updated', () => this.updateFull());
            const el = document.getElementById('buyHangarAmount');
            if (el) el.addEventListener('input', () => this.updateFull());
        }
    }

    update() {
        if (!game) return;
        this.updateElementText("hangarSending", game.hangar.sendRate + " in " + round1(game.hangar.timeRemaining / 10) + " seconds.");
    }

    updateFull() {
        if (!game) return;
        const el = document.getElementById('buyHangarAmount') as HTMLInputElement;
        const amount = el ? Number(el.value) : 1;
        this.updateElementText('hangarCost', intToString(amount * 1000000));
        this.update();
    }
}
