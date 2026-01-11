import { game } from '../main';

export default class Energy {
    unlocked: boolean;
    battery: number;
    drain: number = 0;
    powerPerTick: number = 0;

    static readonly UNLOCK_METAL_COST = 500;
    static readonly BATTERY_OXYGEN_COST = 3e4;
    static readonly BATTERY_SCIENCE_COST = 2e4;

    constructor() {
        this.unlocked = false;
        this.battery = 100;
    }

    unlockEnergy() {
        if (game && game.metal >= Energy.UNLOCK_METAL_COST) {
            game.metal -= Energy.UNLOCK_METAL_COST;
            this.unlocked = true;
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