import { game } from '../main';
import { OrbitingResource } from '../types';

export default class SpaceStation {
    unlocked: number;
    orbiting: OrbitingResource[];
    waterIncome: number = 0;
    powerSpending: number = 0;

    constructor() {
        this.unlocked = 0;
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
        if (game && game.metal >= 2000 && game.wood >= 20000) {
            game.metal -= 2000;
            game.wood -= 20000;
            this.unlocked = 1;
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
