import { game } from '../main';

export default class Energy {
    unlocked: number;
    battery: number;
    drain: number = 0;

    constructor() {
        this.unlocked = 0;
        this.battery = 100;
    }

    unlockEnergy() {
        if (game && game.metal >= 500) {
            game.metal -= 500;
            this.unlocked = 1;
            game.events.emit('energy:unlocked');
        }
        game?.events.emit('energy:battery:updated');
    }

    tick() {
        if (!game) return;
        const excess = game.power - this.battery;
        this.drain = 0;
        if (excess > 0) {
            this.drain = excess / 500;
            game.power -= this.drain;
        }
    }

    gainEnergy(amount: number) {
        if (game) game.power += amount;
    }

    buyBattery(amount: number) {
        this.battery += amount;
        game?.events.emit('energy:battery:updated');
    }
}