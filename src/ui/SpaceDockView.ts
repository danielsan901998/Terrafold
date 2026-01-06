import { game } from '../main';
import { intToString } from '../utils/utils';
import BaseView from './BaseView';
import UIEvents from './UIEvents';

export default class SpaceDockView extends BaseView {

    constructor() {
        super();
        if (game) {
            UIEvents.on(game.events, 'spaceDock:unlocked', () => {
                this.checkUnlocked();
                this.updateFull();
            });
            UIEvents.on(game.events, 'spaceDock:updated', () => UIEvents.notifyOnlyOnce(() => this.update()));
        }
    }

    checkUnlocked() {
        if (!game) return;
        if (game.spaceDock.unlocked) {
            this.setVisible('spaceDockContainer', true);
            this.setVisible('hangarContainer', true);
            this.setVisible('spaceCanvas', true);
            this.setVisible('spaceContainer', true);
            this.update();
        } else {
            this.setVisible('spaceDockContainer', false);
            this.setVisible('hangarContainer', false);
            this.setVisible('spaceCanvas', false);
            this.setVisible('spaceContainer', false);
        }
    }

    public override updateFull() {
        if (!game) return;
        this.checkUnlocked();
        if (game.spaceDock.unlocked) {
            this.update();
        }
    }

    override update() {
        if (!game) return;
        this.updateElementText('battleships', intToString(game.spaceDock.battleships));
        this.updateElementText('totalBattleships', intToString(game.spaceDock.battleships + game.spaceDock.sended));

        const el = document.getElementById('buyBattleshipAmount') as HTMLInputElement;
        const amount = el ? Number(el.value) : 1;
        this.updateElementText('battleshipCost', intToString(amount * 3e7) + " oxygen and " + intToString(amount * 1.5e7) + " science");
    }
}
