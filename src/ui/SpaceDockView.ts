import { game } from '../main';
import { intToString } from '../utils/utils';
import BaseView from './BaseView';

export default class SpaceDockView extends BaseView {

    constructor() {
        super();
        if (game) {
            game.events.on('spaceDock:unlocked', () => this.checkUnlocked());
            game.events.on('spaceDock:updated', () => this.update());
        }
    }

    checkUnlocked() {
        if (!game) return;
        if (game.spaceDock.unlocked) {
            this.getElement('spaceDockContainer').style.display = "flex";
            this.getElement('hangarContainer').style.display = "flex";
            this.getElement('spaceCanvas').style.display = "block";
            this.getElement('spaceContainer').style.display = "flex";
        } else {
            this.getElement('spaceDockContainer').style.display = "none";
            this.getElement('hangarContainer').style.display = "none";
            this.getElement('spaceCanvas').style.display = "none";
            this.getElement('spaceContainer').style.display = "none";
        }
    }

    update() {
        if (!game) return;
        this.updateElementText('battleships', String(game.spaceDock.battleships));

        const el = document.getElementById('buyBattleshipAmount') as HTMLInputElement;
        const amount = el ? Number(el.value) : 1;
        this.updateElementText('battleshipCost', intToString(amount * 3e7) + " oxygen and " + intToString(amount * 1.5e7) + " science");
    }
}
