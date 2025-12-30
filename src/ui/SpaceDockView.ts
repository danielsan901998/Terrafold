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
            this.getElement('spaceDockContainer').style.display = "inline-block";
            this.getElement('hangarContainer').style.display = "inline-block";
            this.getElement('spaceCanvas').style.display = "inline-block";
            this.getElement('spaceContainer').style.display = "inline-block";
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
    }
}
