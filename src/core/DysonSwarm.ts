import { game } from '../main';

export default class DysonSwarm {
    unlocked: boolean = false;
    satellites: number = 0;
    
    // Constants for balancing
    static readonly SATELLITE_METAL_COST = 1e5;
    static readonly SATELLITE_SCIENCE_COST = 1e8;
    static readonly POWER_PER_SATELLITE = 100;

    static readonly UNLOCK_METAL_COST = 1e7;
    static readonly UNLOCK_SCIENCE_COST = 1e12;

    unlockDysonSwarm() {
        if (!game) return;
        if (game.science >= DysonSwarm.UNLOCK_SCIENCE_COST && game.metal >= DysonSwarm.UNLOCK_METAL_COST) {
            game.science -= DysonSwarm.UNLOCK_SCIENCE_COST;
            game.metal -= DysonSwarm.UNLOCK_METAL_COST;
            this.unlocked = true;
            game.events.emit('dysonSwarm:unlocked');
        }
        game.events.emit('dysonSwarm:updated');
    }

    buySatellites(amount: number) {
        if (!game || !this.unlocked) return;
        
        const totalMetalCost = amount * DysonSwarm.SATELLITE_METAL_COST;
        const totalScienceCost = amount * DysonSwarm.SATELLITE_SCIENCE_COST;

        if (game.metal >= totalMetalCost && game.science >= totalScienceCost) {
            game.metal -= totalMetalCost;
            game.science -= totalScienceCost;
            this.satellites += amount;
            game.events.emit('dysonSwarm:updated');
        }
    }

    tick() {
        if (!this.unlocked || !game) return;
        // Future: Add logic for automated satellite construction or maintenance
    }

    getPowerProduction(): number {
        return this.satellites * DysonSwarm.POWER_PER_SATELLITE;
    }
}
