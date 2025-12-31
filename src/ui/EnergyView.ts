import { game } from '../main';
import { intToString } from '../utils/utils';
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
            this.setVisible('unlockedEnergy', true);
            this.setVisible('unlockEnergy', false);
            if (this.getElement('spaceStationContainer').classList.contains("hidden")) {
                this.getElement('spaceStationContainer').classList.remove("hidden");
            }
        } else {
            this.setVisible('unlockedEnergy', false);
            this.setVisible('unlockEnergy', true);
            if (!this.getElement('spaceStationContainer').classList.contains("hidden")) {
                this.getElement('spaceStationContainer').classList.add("hidden");
            }
        }
    }

    update() {
        if (!game) return;
        this.updateElementText('energy', intToString(game.power));
        this.updateElementText('battery', intToString(game.energy.battery, 1));
        this.updateElementText('drain', intToString(game.energy.drain));

        const el = document.getElementById('buyBattery') as HTMLInputElement;
        const amount = el ? Number(el.value) : 1;
        this.updateElementText('batteryCost', intToString(amount * 3e4) + " oxygen and " + intToString(amount * 2e4) + " science");
    }
}
