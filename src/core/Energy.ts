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
        
        const computerDrain = game.computer.powerSpending;
        const robotsDrain = game.robots.powerSpending;
        const stationDrain = game.spaceStation.powerSpending;
        const tractorDrain = game.tractorBeam.comets.length > 0 ? game.power / 1000 : 0;
        
        this.drain = computerDrain + robotsDrain + stationDrain + tractorDrain;
        
        const dysonProduction = game.dysonSwarm.getPowerProduction();
        
        // Dyson Swarm satellites only increase energy up to the battery amount
        if (game.power < this.battery) {
            game.power += Math.min(dysonProduction, this.battery - game.power);
        }

        // We handle tractor beam drain here instead of in TractorBeam.tick
        // to avoid double counting or inconsistent state.
        // But TractorBeam.pullIntoOrbit actually returns how much it USED.
        // Let's look at TractorBeam.tick again.
        
        game.power -= this.drain;

        if (game.power > this.battery) {
            game.power -= (game.power - this.battery) * 0.02;
        }

        if (game.power < 0) {
            game.power = 0;
        }

        this.powerPerTick = dysonProduction;
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
