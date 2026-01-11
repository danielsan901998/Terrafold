import { game } from '../main';

export default class Energy {
    unlocked: number;
    battery: number;
    drain: number = 0;
    powerPerTick: number = 0;

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
        this.drain = game.computer.powerSpending + game.robots.powerSpending + game.spaceStation.powerSpending;
        this.powerPerTick = (this.battery / 100) + game.dysonSwarm.getPowerProduction();
        game.power += this.powerPerTick;
        game.power -= this.drain;
        if (game.power < 0) {
            game.power = 0;
        }
        game.events.emit('energy:updated');
    }

    gainEnergy(amount: number) {
        if (game) game.power += amount;
    }

    buyBattery(amount: number) {
        this.battery += amount;
        game?.events.emit('energy:battery:updated');
    }
}