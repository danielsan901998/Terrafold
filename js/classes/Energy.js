import { game, view } from '../../main.js';

export default class Energy {
    constructor() {
        this.unlocked = 0;
        this.battery = 100;
    }

    unlockEnergy() {
        if (game.metal >= 500) {
            game.metal -= 500;
            this.unlocked = 1;
            view.checkEnergyUnlocked();
            view.checkSpaceStationUnlocked();
        }
        view.updateEnergy();
    }

    tick() {
        var excess = game.power - this.battery;
        this.drain = 0;
        if (excess > 0) {
            this.drain = excess / 500;
            game.power -= this.drain;
        }
    }

    gainEnergy(amount) {
        game.power += amount;
    }

    buyBattery(amount) {
        this.battery += amount;
    }
}