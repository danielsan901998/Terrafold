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
            this.setVisible('spaceDockContainer', true);
            this.setVisible('hangarContainer', true);
            this.setVisible('spaceCanvas', true);
            this.setVisible('spaceContainer', true);
        } else {
            this.setVisible('spaceDockContainer', false);
            this.setVisible('hangarContainer', false);
            this.setVisible('spaceCanvas', false);
            this.setVisible('spaceContainer', false);
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
