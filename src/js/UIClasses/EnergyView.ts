import { game } from '../../main';
import { intToString } from '../utils';
import BaseView from './BaseView';

export default class EnergyView extends BaseView {

    constructor() {
        super();
        if (game) {
            game.events.on('energy:unlocked', () => this.checkUnlocked());
            game.events.on('energy:updated', () => this.update());
        }
    }

    checkUnlocked() {
        if (!game) return;
        if (game.energy.unlocked) {
            this.getElement('unlockedEnergy').style.display = "inline-block";
            this.getElement('unlockEnergy').style.display = "none";
            if (this.getElement('spaceDockContainer').classList.contains("disabled")) {
                this.getElement('spaceDockContainer').classList.remove("disabled");
            }
        } else {
            this.getElement('unlockedEnergy').style.display = "none";
            this.getElement('unlockEnergy').style.display = "inline-block";
            if (!this.getElement('spaceDockContainer').classList.contains("disabled")) {
                this.getElement('spaceDockContainer').classList.add("disabled");
            }
        }
    }

    update() {
        if (!game) return;
        this.updateElementText('energy', intToString(game.power));
        this.updateElementText('battery', intToString(game.energy.battery, 1));
        this.updateElementText('drain', intToString(game.energy.drain));
    }
}
