import { game } from '../main';
import { OrbitingResource } from '../types';

export default class SpaceStation {
    unlocked: boolean;
    orbiting: OrbitingResource[];
    waterIncome: number = 0;
    powerSpending: number = 0;

    static readonly UNLOCK_METAL_COST = 2000;
    static readonly UNLOCK_WOOD_COST = 20000;

    constructor() {
        this.unlocked = false;
        this.orbiting = [
            {
                type: "ice",
                amount: 1e6
            },
            {
                type: "dirt",
                amount: 500
            }
        ];
    }

    unlockSpaceStation() {
        if (game && game.metal >= SpaceStation.UNLOCK_METAL_COST && game.wood >= SpaceStation.UNLOCK_WOOD_COST) {
            game.metal -= SpaceStation.UNLOCK_METAL_COST;
            game.wood -= SpaceStation.UNLOCK_WOOD_COST;
            this.unlocked = true;
            game.events.emit('spaceStation:unlocked');
        }
        game?.events.emit('spaceStation:updated');
    }

    tick() {
        this.waterIncome = 0;
        if (!this.unlocked || !game) {
            return;
        }
        for (let i = 0; i < this.orbiting.length; i++) {
            const resource = this.orbiting[i]!;
            const take = resource.amount / 100000;
            resource.amount -= take;
            const type = resource.type;
            if (type === "ice") {
                game.ice.ice += take;
                this.waterIncome += take;
            } else if (type === "dirt") {
                game.land.addLand(take);
            }
        }
    }
}
